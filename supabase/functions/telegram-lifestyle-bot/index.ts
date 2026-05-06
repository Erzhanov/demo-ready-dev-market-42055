import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

type TelegramMessage = {
  message_id: number;
  text?: string;
  chat: { id: number; first_name?: string; last_name?: string; username?: string };
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

type GoalRow = {
  id: string;
  user_id: string;
  goal_type: "lose_weight" | "gain_weight" | "maintain";
  gender: "female" | "male" | "other";
  age: number;
  height_cm: number;
  start_weight_kg: number;
  activity_level: "low" | "medium" | "high";
  target_calories: number;
  target_protein_g: number;
  target_fat_g: number;
  target_carbs_g: number;
  plan_data: Record<string, unknown>;
  telegram_chat_id: string | null;
};

const goalLabels: Record<string, string> = {
  lose_weight: "Арықтау",
  gain_weight: "Салмақ қосу",
  maintain: "Форма сақтау",
};

const activityMultiplier: Record<string, number> = {
  low: 1.25,
  medium: 1.45,
  high: 1.65,
};

const goalDelta: Record<string, number> = {
  lose_weight: -350,
  gain_weight: 320,
  maintain: 0,
};

const days = ["Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі", "Жексенбі"];

function getGatewayHeaders() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY is not configured");

  return {
    "Authorization": `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": TELEGRAM_API_KEY,
    "Content-Type": "application/json",
  };
}

function calculatePlan(goal: GoalRow) {
  const baseBmr =
    10 * Number(goal.start_weight_kg) +
    6.25 * Number(goal.height_cm) -
    5 * Number(goal.age) +
    (goal.gender === "male" ? 5 : goal.gender === "female" ? -161 : -78);
  const calories = Math.max(1250, Math.round(baseBmr * activityMultiplier[goal.activity_level] + goalDelta[goal.goal_type]));
  const proteinG = Math.round(Number(goal.start_weight_kg) * (goal.goal_type === "gain_weight" ? 1.9 : goal.goal_type === "lose_weight" ? 1.7 : 1.5));
  const fatG = Math.round((calories * 0.27) / 9);
  const carbsG = Math.max(90, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  const waterLiters = Number(Math.min(3.4, Math.max(1.8, Number(goal.start_weight_kg) * 0.033)).toFixed(1));
  const restDays = goal.goal_type === "gain_weight" ? ["Сәрсенбі", "Жексенбі"] : ["Бейсенбі", "Жексенбі"];

  return {
    calories, proteinG, fatG, carbsG, waterLiters, restDays,
    workouts: days.map((day, index) => {
      if (restDays.includes(day)) return { day, focus: "Қалпына келу", details: "Серуен, созылу, ұйқы режимін сақтау." };
      if (goal.goal_type === "lose_weight") return { day, focus: index % 2 === 0 ? "Кардио" : "Толық денеге жеңіл жаттығу", details: "Отырып-тұру, тіреп тұру, қолды бүгіп-жазудың жеңіл нұсқалары." };
      if (goal.goal_type === "gain_weight") return { day, focus: index % 2 === 0 ? "Күш жаттығулары" : "Жоғарғы/төменгі дене", details: "Орташа салмақ, сет арасында демалу, ақуызды ас." };
      return { day, focus: "Теңгерімді толық дене жаттығуы", details: "Толық дене жаттығуы, қозғалыс икемділігі, серуен." };
    }),
  };
}

function extractCommand(text = "") {
  const [command, ...rest] = text.trim().split(/\s+/);
  return { command: command?.toLowerCase() || "", value: rest.join(" ").trim() };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function sendTelegram(chatId: string | number, text: string) {
  const headers = getGatewayHeaders();
  const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: {
        keyboard: [
          [{ text: "/plan" }, { text: "/norms" }],
          [{ text: "/checkin workout water meals sleep" }],
          [{ text: "/weight 70" }, { text: "/reminders" }],
        ],
        resize_keyboard: true,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API failed [${response.status}]: ${body}`);
  }
}

function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service credentials are not configured");
  return createClient(url, key);
}

async function getLinkedGoal(supabase: ReturnType<typeof createAdminClient>, chatId: number) {
  const { data } = await supabase
    .from("user_goals")
    .select("*")
    .eq("telegram_chat_id", String(chatId))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as GoalRow | null;
}

async function getProfileName(supabase: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await supabase.from("profiles").select("full_name").eq("user_id", userId).maybeSingle();
  return data?.full_name || "AIZHAN қолданушысы";
}

async function linkByCode(supabase: ReturnType<typeof createAdminClient>, chat: TelegramMessage["chat"], code: string) {
  const normalizedCode = code.replace("/start", "").trim();
  if (!normalizedCode) return null;

  const { data: goal, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("telegram_link_code", normalizedCode)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !goal) return null;

  const channels = { ...((goal.notification_channels || {}) as Record<string, boolean>), telegram: true };
  const { data: updated } = await supabase
    .from("user_goals")
    .update({ telegram_chat_id: String(chat.id), notification_channels: channels, telegram_link_code: null })
    .eq("id", goal.id)
    .select("*")
    .single();

  return updated as GoalRow | null;
}

function planText(goal: GoalRow, name: string) {
  const plan = calculatePlan(goal);
  const workout = plan.workouts[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  return [
    `Сәлем, <b>${name}</b>.`,
    `Мақсат: <b>${goalLabels[goal.goal_type]}</b>`,
    `Калория: <b>${plan.calories} ккал</b>`,
    `Ақуыз: <b>${plan.proteinG} г</b>, май: <b>${plan.fatG} г</b>, көмірсу: <b>${plan.carbsG} г</b>`,
    `Су нормасы: <b>${plan.waterLiters} л</b>`,
    `Бүгінгі жаттығу: <b>${workout.focus}</b>`,
    workout.details,
    "",
    "Командалар: /norms, /weight 70, /goal maintain, /checkin workout water meals sleep, /reminders",
  ].join("\n");
}

async function handleUserMessage(message: TelegramMessage) {
  const supabase = createAdminClient();
  const { command, value } = extractCommand(message.text || "");

  if (command === "/start") {
    const linked = await linkByCode(supabase, message.chat, value);
    if (!linked) {
      await sendTelegram(message.chat.id, "AIZHAN Lifestyle ботына қош келдіңіз.\n\nСайттағы Lifestyle -> Ескерту бөліміне кіріп, Telegram байланыстыру ID көшіріңіз де, осы жерге жіберіңіз немесе /start ID түрінде бастаңыз.");
      return;
    }
    const name = await getProfileName(supabase, linked.user_id);
    await sendTelegram(message.chat.id, `Авторизация сәтті өтті.\nПрофиль: <b>${name}</b>\n\n${planText(linked, name)}`);
    return;
  }

  if (/^[A-Z0-9]{4,8}$/i.test((message.text || "").trim()) || /^[0-9a-f-]{20,}$/i.test((message.text || "").trim())) {
    const linked = await linkByCode(supabase, message.chat, (message.text || "").trim());
    if (linked) {
      const name = await getProfileName(supabase, linked.user_id);
      await sendTelegram(message.chat.id, `ID қабылданды. Профиль: <b>${name}</b>\n\n${planText(linked, name)}`);
      return;
    }
  }

  const goal = await getLinkedGoal(supabase, message.chat.id);
  if (!goal) {
    await sendTelegram(message.chat.id, "Сіз әлі авторизацияланбағансыз. Сайттағы Telegram байланыстыру ID жіберіңіз.");
    return;
  }

  const name = await getProfileName(supabase, goal.user_id);

  if (command === "/help") {
    await sendTelegram(message.chat.id, "Командалар:\n/plan - толық жоспар\n/norms - калория мен макро\n/weight 70 - салмақ енгізу\n/goal lose_weight|gain_weight|maintain - мақсат ауыстыру\n/checkin workout water meals sleep - күндік бақылау\n/reminders - ескертулер");
    return;
  }

  if (command === "/plan") { await sendTelegram(message.chat.id, planText(goal, name)); return; }

  if (command === "/norms") {
    const plan = calculatePlan(goal);
    await sendTelegram(message.chat.id, `Нормалар:\nКалория: ${plan.calories} ккал\nАқуыз: ${plan.proteinG} г\nМай: ${plan.fatG} г\nКөмірсу: ${plan.carbsG} г\nСу: ${plan.waterLiters} л`);
    return;
  }

  if (command === "/weight") {
    const weight = Number(value.replace(",", "."));
    if (!Number.isFinite(weight) || weight < 25 || weight > 350) {
      await sendTelegram(message.chat.id, "Салмақты былай енгізіңіз: /weight 70");
      return;
    }
    await supabase.from("weight_history").insert({ user_id: goal.user_id, goal_id: goal.id, weight_kg: weight, recorded_at: todayStr() });
    await sendTelegram(message.chat.id, `Салмақ жазылды: <b>${weight} кг</b>.`);
    return;
  }

  if (command === "/goal") {
    if (!["lose_weight", "gain_weight", "maintain"].includes(value)) {
      await sendTelegram(message.chat.id, "Мақсатты былай ауыстырыңыз: /goal lose_weight немесе /goal gain_weight немесе /goal maintain");
      return;
    }
    const nextGoal = { ...goal, goal_type: value as GoalRow["goal_type"] };
    const plan = calculatePlan(nextGoal);
    await supabase.from("user_goals").update({ goal_type: value, target_calories: plan.calories, target_protein_g: plan.proteinG, target_fat_g: plan.fatG, target_carbs_g: plan.carbsG, plan_data: plan }).eq("id", goal.id);
    await sendTelegram(message.chat.id, `Мақсат жаңартылды: <b>${goalLabels[value]}</b>.\n${planText(nextGoal, name)}`);
    return;
  }

  if (command === "/checkin") {
    const tokens = value.toLowerCase().split(/\s+/);
    await supabase.from("daily_checkins").upsert({
      user_id: goal.user_id, goal_id: goal.id, completed_at: todayStr(),
      workout_done: tokens.includes("workout"), water_done: tokens.includes("water"),
      meals_done: tokens.includes("meals"), sleep_done: tokens.includes("sleep"),
      mood_score: tokens.filter(Boolean).length,
      ai_feedback: tokens.length >= 3 ? "Керемет тәртіп. Осы қарқынды сақтаңыз." : "Бір қадам да прогресс. Ертең қайта жалғастырыңыз.",
    }, { onConflict: "user_id,completed_at" });
    await sendTelegram(message.chat.id, "Check-in сақталды.");
    return;
  }

  if (command === "/reminders") {
    const { data } = await supabase
      .from("lifestyle_reminders")
      .select("reminder_type, scheduled_time, channel, is_enabled")
      .eq("user_id", goal.user_id)
      .eq("is_enabled", true)
      .order("scheduled_time", { ascending: true });
    const lines = (data || []).map((item) => `${item.scheduled_time} - ${item.reminder_type} (${item.channel})`);
    await sendTelegram(message.chat.id, lines.length ? `Ескертулер:\n${lines.join("\n")}` : "Әзірге белсенді ескерту жоқ. Сайттағы Ескерту бөлімінен қосыңыз.");
    return;
  }

  await sendTelegram(message.chat.id, "Команда түсініксіз. /help деп жазыңыз.");
}

async function sendDueNotifications() {
  const supabase = createAdminClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, user_id, title, body")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(50);

  let sent = 0;

  for (const notification of notifications || []) {
    const { data: goal } = await supabase
      .from("user_goals")
      .select("telegram_chat_id")
      .eq("user_id", notification.user_id)
      .not("telegram_chat_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!goal?.telegram_chat_id) continue;

    try {
      await sendTelegram(goal.telegram_chat_id, `<b>${notification.title}</b>\n${notification.body}`);
      await supabase.from("notifications").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", notification.id);
      sent += 1;
    } catch (error) {
      await supabase.from("notifications").update({ status: "failed", metadata: { error: error instanceof Error ? error.message : "Unknown error" } }).eq("id", notification.id);
    }
  }

  return sent;
}

async function pollUpdates() {
  const supabase = createAdminClient();
  const MAX_RUNTIME_MS = 55_000;
  const MIN_REMAINING_MS = 5_000;
  const startTime = Date.now();

  // Get or create bot state
  const { data: state } = await supabase
    .from("telegram_bot_state")
    .select("update_offset")
    .eq("id", 1)
    .single();

  let currentOffset = state?.update_offset || 0;
  let totalProcessed = 0;
  const headers = getGatewayHeaders();

  while (true) {
    const elapsed = Date.now() - startTime;
    const remainingMs = MAX_RUNTIME_MS - elapsed;
    if (remainingMs < MIN_REMAINING_MS) break;

    const timeout = Math.min(50, Math.floor(remainingMs / 1000) - 5);
    if (timeout < 1) break;

    const response = await fetch(`${GATEWAY_URL}/getUpdates`, {
      method: "POST",
      headers,
      body: JSON.stringify({ offset: currentOffset, timeout, allowed_updates: ["message"] }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("getUpdates failed:", data);
      break;
    }

    const updates: TelegramUpdate[] = data.result ?? [];
    if (updates.length === 0) continue;

    for (const update of updates) {
      if (update.message) {
        try {
          await handleUserMessage(update.message);
        } catch (err) {
          console.error("Error handling message:", err);
        }
      }
    }

    const newOffset = Math.max(...updates.map((u) => u.update_id)) + 1;
    await supabase
      .from("telegram_bot_state")
      .upsert({ id: 1, update_offset: newOffset, updated_at: new Date().toISOString() }, { onConflict: "id" });
    currentOffset = newOffset;
    totalProcessed += updates.length;
  }

  return totalProcessed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();

    if (body?.mode === "send_due") {
      const sent = await sendDueNotifications();
      return new Response(JSON.stringify({ success: true, sent }), { headers: jsonHeaders });
    }

    if (body?.mode === "poll") {
      const processed = await pollUpdates();
      return new Response(JSON.stringify({ ok: true, processed }), { headers: jsonHeaders });
    }

    // Legacy webhook mode
    const update = body as TelegramUpdate;
    if (update.message) await handleUserMessage(update.message);

    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders });
  } catch (error) {
    console.error("telegram lifestyle bot error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
