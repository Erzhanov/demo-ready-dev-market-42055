import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  AlertTriangle,
  Apple,
  Bell,
  CheckCircle2,
  Copy,
  Droplets,
  Dumbbell,
  ExternalLink,
  HeartPulse,
  Moon,
  Save,
  Scale,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  ActivityLevel,
  BloodPressure,
  Gender,
  LifestyleGoal,
  activityLabels,
  bloodPressureLabels,
  calculateLifestylePlan,
  goalLabels,
  parseAllergies,
} from "@/lib/lifestyle";

type ReminderChannel = "in_app" | "browser" | "telegram";

const today = new Date().toISOString().slice(0, 10);

const reminderTypes = [
  { key: "meal", label: "Тамақ", time: "08:00", icon: Apple },
  { key: "water", label: "Су", time: "10:30", icon: Droplets },
  { key: "workout", label: "Жаттығу", time: "18:30", icon: Dumbbell },
  { key: "sleep", label: "Ұйқы", time: "22:30", icon: Moon },
] as const;

const LifestylePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>("female");
  const [age, setAge] = useState("25");
  const [heightCm, setHeightCm] = useState("165");
  const [weightKg, setWeightKg] = useState("60");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("medium");
  const [goal, setGoal] = useState<LifestyleGoal>("maintain");
  const [allergies, setAllergies] = useState("");
  const [bloodPressure, setBloodPressure] = useState<BloodPressure>("unknown");
  const [weightEntry, setWeightEntry] = useState("");
  const [checkIn, setCheckIn] = useState({ workout: false, water: false, meals: false, sleep: false });
  const [reminderChannels, setReminderChannels] = useState<Record<ReminderChannel, boolean>>({
    in_app: true,
    browser: false,
    telegram: false,
  });
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramLinkCode, setTelegramLinkCode] = useState("");
  const [reminders, setReminders] = useState<Record<string, boolean>>({
    meal: true,
    water: true,
    workout: true,
    sleep: true,
  });
  const [reminderTimes, setReminderTimes] = useState<Record<string, string>>({
    meal: "08:00",
    water: "10:30",
    workout: "18:30",
    sleep: "22:30",
  });
  const [recentWeights, setRecentWeights] = useState<Array<{ id: string; weight_kg: number; recorded_at: string }>>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<Array<{ id: string; completed_at: string; workout_done: boolean; water_done: boolean; meals_done: boolean; sleep_done: boolean }>>([]);
  const [inAppNotifications, setInAppNotifications] = useState<Array<{ id: string; title: string; body: string; status: string; scheduled_for: string }>>([]);
  const botUrl = import.meta.env.VITE_TELEGRAM_BOT_URL || "https://t.me/AIZHAN_lifestyle_bot";

  const numericProfile = useMemo(
    () => ({
      gender,
      age: Number(age) || 25,
      heightCm: Number(heightCm) || 165,
      weightKg: Number(weightKg) || 60,
      activityLevel,
      goal,
      allergies: parseAllergies(allergies),
      bloodPressure,
    }),
    [activityLevel, age, allergies, bloodPressure, gender, goal, heightCm, weightKg],
  );
  const plan = useMemo(() => calculateLifestylePlan(numericProfile), [numericProfile]);
  const currentDayWorkout = plan.workouts[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const completedCount = Object.values(checkIn).filter(Boolean).length;
  const streak = recentCheckIns.filter((item) => item.workout_done || item.water_done || item.meals_done || item.sleep_done).length;
  const lastWeight = recentWeights[0]?.weight_kg;
  const firstWeight = recentWeights[recentWeights.length - 1]?.weight_kg;
  const weightDelta = typeof lastWeight === "number" && typeof firstWeight === "number" ? Number((lastWeight - firstWeight).toFixed(1)) : 0;

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const loadLifestyle = async () => {
      const [{ data: profile }, { data: goals }, { data: weights }, { data: checks }, { data: notifications }] = await Promise.all([
        supabase.from("profiles").select("allergies, blood_pressure").eq("user_id", user.id).single(),
        supabase.from("user_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("weight_history").select("id, weight_kg, recorded_at").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(8),
        supabase.from("daily_checkins").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(7),
        supabase.from("notifications").select("id, title, body, status, scheduled_for").eq("user_id", user.id).order("scheduled_for", { ascending: false }).limit(5),
      ]);

      if (!isMounted) return;

      const profileData = profile as { allergies?: string[] | null; blood_pressure?: BloodPressure | null } | null;
      if (profileData?.allergies?.length) setAllergies(profileData.allergies.join(", "));
      if (profileData?.blood_pressure) setBloodPressure(profileData.blood_pressure);

      const goalData = goals as unknown as {
        id: string;
        gender: Gender;
        age: number;
        height_cm: number;
        start_weight_kg: number;
        activity_level: ActivityLevel;
        goal_type: LifestyleGoal;
        notification_channels?: Record<ReminderChannel, boolean> | null;
        telegram_chat_id?: string | null;
        telegram_link_code?: string | null;
      } | null;

      if (goalData) {
        setGoalId(goalData.id);
        setGender(goalData.gender);
        setAge(String(goalData.age));
        setHeightCm(String(goalData.height_cm));
        setWeightKg(String(goalData.start_weight_kg));
        setWeightEntry(String(goalData.start_weight_kg));
        setActivityLevel(goalData.activity_level);
        setGoal(goalData.goal_type);
        setReminderChannels((current) => ({ ...current, ...(goalData.notification_channels || {}) }));
        setTelegramChatId(goalData.telegram_chat_id || "");
        setTelegramLinkCode(goalData.telegram_link_code || "");
      }

      setRecentWeights((weights || []) as Array<{ id: string; weight_kg: number; recorded_at: string }>);
      setRecentCheckIns((checks || []) as Array<{ id: string; completed_at: string; workout_done: boolean; water_done: boolean; meals_done: boolean; sleep_done: boolean }>);
      setInAppNotifications((notifications || []) as Array<{ id: string; title: string; body: string; status: string; scheduled_for: string }>);
    };

    void loadLifestyle();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const savePlan = async () => {
    if (!user) return;
    setLoading(true);

    const profileUpdate = supabase
      .from("profiles")
      .update({ allergies: numericProfile.allergies, blood_pressure: bloodPressure })
      .eq("user_id", user.id);

    const goalPayload = {
      user_id: user.id,
      gender,
      age: numericProfile.age,
      height_cm: numericProfile.heightCm,
      start_weight_kg: numericProfile.weightKg,
      activity_level: activityLevel,
      goal_type: goal,
      target_calories: plan.calories,
      target_protein_g: plan.proteinG,
      target_fat_g: plan.fatG,
      target_carbs_g: plan.carbsG,
      plan_data: plan,
      notification_channels: reminderChannels,
      telegram_chat_id: telegramChatId.trim() || null,
    };

    const goalRequest = goalId
      ? supabase.from("user_goals").update(goalPayload as never).eq("id", goalId).select("id").single()
      : supabase.from("user_goals").insert(goalPayload as never).select("id").single();

    const [{ error: profileError }, { data, error: goalError }] = await Promise.all([profileUpdate, goalRequest]);

    const newGoalId = (data as { id: string } | null)?.id || goalId;
    if (!profileError && !goalError && newGoalId) {
      await saveReminders(newGoalId);
      setGoalId(newGoalId);
      toast({ title: "Жоспар сақталды", description: "AI Lifestyle Coach деректері жаңартылды." });
    } else {
      toast({
        title: "Қате",
        description: profileError?.message || goalError?.message || "Жоспарды сақтау мүмкін болмады.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const saveReminders = async (activeGoalId: string) => {
    if (!user) return;
    const rows = reminderTypes
      .filter((item) => reminders[item.key])
      .map((item) => ({
        user_id: user.id,
        goal_id: activeGoalId,
        reminder_type: item.key,
        channel: reminderChannels.telegram ? "telegram" : reminderChannels.browser ? "browser" : "in_app",
        scheduled_time: reminderTimes[item.key],
        is_enabled: true,
        message_template:
          item.key === "workout"
            ? "Бүгін жаттығу күніңіз. Қарқынды өз жағдайыңызға қарай реттеңіз."
            : item.key === "water"
              ? `Су ішуді ұмытпаңыз. Күндік мақсат: ${plan.waterLiters} л.`
              : item.key === "sleep"
                ? "Ұйқы режимін дайындаңыз. Қалпына келу де жоспардың бөлігі."
                : "Тамақтану уақытын өткізіп алмаңыз.",
      }));

    if (rows.length > 0) {
      await supabase.from("lifestyle_reminders").upsert(rows, { onConflict: "user_id,reminder_type,channel" });
    }
  };

  const saveCheckIn = async () => {
    if (!user) return;
    const { error } = await supabase.from("daily_checkins").upsert(
      {
        user_id: user.id,
        goal_id: goalId,
        completed_at: today,
        workout_done: checkIn.workout,
        water_done: checkIn.water,
        meals_done: checkIn.meals,
        sleep_done: checkIn.sleep,
        mood_score: completedCount,
        ai_feedback:
          completedCount >= 3
            ? "Керемет қарқын. Осы режимді ертең де сақтаңыз."
            : "Бүгін толық орындалмаса да, бір шағын қадамнан қайта бастаңыз.",
      },
      { onConflict: "user_id,completed_at" },
    );

    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }

    if (completedCount >= 3) {
      toast({ title: "Жарайсыз", description: "Бүгінгі тәртіп жақсы орындалды." });
    } else {
      toast({ title: "Check-in сақталды", description: "AI ертең жеңіл қадамдармен қайта бағыттайды." });
    }
  };

  const saveWeight = async () => {
    if (!user || !weightEntry) return;
    const value = Number(weightEntry);
    const { error } = await supabase.from("weight_history").insert({
      user_id: user.id,
      goal_id: goalId,
      weight_kg: value,
      recorded_at: today,
    });

    if (error) {
      toast({ title: "Қате", description: error.message, variant: "destructive" });
      return;
    }

    setRecentWeights([{ id: crypto.randomUUID(), weight_kg: value, recorded_at: today }, ...recentWeights].slice(0, 8));
    toast({ title: "Салмақ жазылды", description: "Прогресс кестесі жаңартылды." });
  };

  const requestBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      toast({ title: "Қолдау жоқ", description: "Бұл браузер push notification қолдамайды.", variant: "destructive" });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setReminderChannels((current) => ({ ...current, browser: true }));
      new Notification("AIZHAN Lifestyle Coach", { body: "Браузерлік ескертулер қосылды." });
    }
  };

  const copyTelegramLinkCode = async () => {
    if (!telegramLinkCode) {
      toast({ title: "Алдымен сақтаңыз", description: "Telegram ID шығуы үшін жоспарды бір рет сақтаңыз." });
      return;
    }

    await navigator.clipboard.writeText(telegramLinkCode);
    toast({ title: "Көшірілді", description: "Telegram байланыстыру ID көшірілді." });
  };

  return (
    <Layout>
      <div className="space-y-5 pb-8">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-soft rounded-3xl border border-border/80 p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI Lifestyle Coach
              </span>
              <span>диетолог + фитнес + дисциплина ассистенті</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Күнделікті режимді бақылау орталығы</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Жеке параметрлеріңізге сүйеніп калория, макро баланс, жаттығу, демалыс және ескерту жүйесін құрады. Ұсыныстар ақпараттық сипатта.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Metric icon={Apple} label="Калория" value={`${plan.calories} ккал`} />
              <Metric icon={Dumbbell} label="Ақуыз" value={`${plan.proteinG} г`} />
              <Metric icon={Droplets} label="Су" value={`${plan.waterLiters} л`} />
              <Metric icon={TrendingUp} label="Streak" value={`${streak} күн`} />
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-card dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Қауіпсіздік ескертуі</h2>
                <p className="mt-2 text-sm leading-6 opacity-85">
                  Бұл медициналық диагноз немесе ем емес. Қан қысымы, созылмалы ауру, жүктілік немесе ауыр симптом болса, дәрігерге жүгініңіз.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {plan.safetyNotes.map((note) => (
                <p key={note} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{note}</span>
                </p>
              ))}
            </div>
          </div>
        </section>

        <Tabs defaultValue="onboarding" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl p-1 sm:grid-cols-4">
            <TabsTrigger value="onboarding" className="rounded-xl">Профиль</TabsTrigger>
            <TabsTrigger value="plan" className="rounded-xl">Жоспар</TabsTrigger>
            <TabsTrigger value="discipline" className="rounded-xl">Бақылау</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-xl">Ескерту</TabsTrigger>
          </TabsList>

          <TabsContent value="onboarding" className="rounded-3xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Жынысы">
                <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Әйел</SelectItem>
                    <SelectItem value="male">Ер</SelectItem>
                    <SelectItem value="other">Басқа</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Жасы"><Input value={age} onChange={(e) => setAge(e.target.value)} type="number" className="h-11 rounded-xl" /></Field>
              <Field label="Бойы, см"><Input value={heightCm} onChange={(e) => setHeightCm(e.target.value)} type="number" className="h-11 rounded-xl" /></Field>
              <Field label="Салмағы, кг"><Input value={weightKg} onChange={(e) => setWeightKg(e.target.value)} type="number" className="h-11 rounded-xl" /></Field>
              <Field label="Белсенділік">
                <Select value={activityLevel} onValueChange={(value) => setActivityLevel(value as ActivityLevel)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(activityLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Мақсат">
                <Select value={goal} onValueChange={(value) => setGoal(value as LifestyleGoal)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(goalLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Аллергия">
                <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="h-11 rounded-xl" placeholder="жаңғақ, сүт, бал..." />
              </Field>
              <Field label="Қан қысымы">
                <Select value={bloodPressure} onValueChange={(value) => setBloodPressure(value as BloodPressure)}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(bloodPressureLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Button onClick={savePlan} disabled={loading} className="mt-5 h-11 rounded-xl gradient-medical px-5 text-primary-foreground">
              {loading ? <div className="spinner-ring h-5 w-5" /> : <><Save className="mr-2 h-4 w-4" /> Жоспарды сақтау</>}
            </Button>
          </TabsContent>

          <TabsContent value="plan" className="space-y-4">
            <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-card">
                <h2 className="flex items-center gap-2 font-semibold"><Apple className="h-5 w-5 text-primary" /> Тамақтану режимі</h2>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <Macro label="Ақуыз" value={plan.proteinG} />
                  <Macro label="Май" value={plan.fatG} />
                  <Macro label="Көмірсу" value={plan.carbsG} />
                </div>
                <div className="mt-4 space-y-3">
                  {plan.meals.map((meal) => (
                    <div key={meal.title} className="rounded-2xl border border-border/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{meal.title}</p>
                        <span className="text-xs text-muted-foreground">{meal.time}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{meal.items.join(" • ")}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-card">
                <h2 className="flex items-center gap-2 font-semibold"><Dumbbell className="h-5 w-5 text-primary" /> Апталық жаттығу</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {plan.workouts.map((workout) => (
                    <div key={workout.day} className="rounded-2xl border border-border/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{workout.day}</p>
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">{workout.intensity}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-primary">{workout.focus}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{workout.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="discipline" className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-primary" /> Бүгінгі check-in</h2>
              <p className="mt-2 text-sm text-muted-foreground">Бүгінгі жаттығу: {currentDayWorkout.focus}. Орындалған әр қадам прогреске қосылады.</p>
              <div className="mt-4 space-y-3">
                <ToggleRow label="Жаттығу жасадым" checked={checkIn.workout} onChange={(checked) => setCheckIn((current) => ({ ...current, workout: checked }))} />
                <ToggleRow label="Су нормасын ішіп жүрмін" checked={checkIn.water} onChange={(checked) => setCheckIn((current) => ({ ...current, water: checked }))} />
                <ToggleRow label="Тамақтану жоспарын ұстандым" checked={checkIn.meals} onChange={(checked) => setCheckIn((current) => ({ ...current, meals: checked }))} />
                <ToggleRow label="Ұйқы режимін сақтадым" checked={checkIn.sleep} onChange={(checked) => setCheckIn((current) => ({ ...current, sleep: checked }))} />
              </div>
              <Button onClick={saveCheckIn} className="mt-5 h-11 rounded-xl gradient-medical text-primary-foreground">
                <Send className="mr-2 h-4 w-4" /> Check-in жіберу
              </Button>
            </section>

            <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-semibold"><Scale className="h-5 w-5 text-primary" /> Салмақ прогресі</h2>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input value={weightEntry} onChange={(e) => setWeightEntry(e.target.value)} type="number" className="h-11 rounded-xl" placeholder="Бүгінгі салмақ" />
                <Button onClick={saveWeight} variant="outline" className="h-11 rounded-xl">Жазу</Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Metric icon={HeartPulse} label="Қазіргі салмақ" value={lastWeight ? `${lastWeight} кг` : "-"} />
                <Metric icon={Activity} label="Өзгеріс" value={`${weightDelta > 0 ? "+" : ""}${weightDelta} кг`} />
              </div>
              <div className="mt-4 space-y-2">
                {recentWeights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Әзірге салмақ тарихы жоқ.</p>
                ) : recentWeights.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-secondary/60 px-3 py-2 text-sm">
                    <span>{entry.recorded_at}</span>
                    <span className="font-medium">{entry.weight_kg} кг</span>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="notifications" className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-semibold"><Bell className="h-5 w-5 text-primary" /> Хабарлама арналары</h2>
              <div className="mt-4 space-y-3">
                <ToggleRow label="Сайт ішіндегі хабарламалар" checked={reminderChannels.in_app} onChange={(checked) => setReminderChannels((current) => ({ ...current, in_app: checked }))} />
                <ToggleRow label="Браузерлік push notifications" checked={reminderChannels.browser} onChange={(checked) => checked ? requestBrowserNotifications() : setReminderChannels((current) => ({ ...current, browser: false }))} />
                <ToggleRow label="Telegram бот ескертулері" checked={reminderChannels.telegram} onChange={(checked) => setReminderChannels((current) => ({ ...current, telegram: checked }))} />
                {reminderChannels.telegram && (
                  <div className="rounded-2xl border border-border/70 p-3">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                      <Field label="Telegram байланыстыру ID">
                        <Input value={telegramLinkCode || "Жоспарды сақтағаннан кейін шығады"} readOnly className="h-11 rounded-xl bg-secondary/60" />
                      </Field>
                      <Button type="button" variant="outline" onClick={copyTelegramLinkCode} className="h-11 rounded-xl">
                        <Copy className="mr-2 h-4 w-4" /> Көшіру
                      </Button>
                      <Button type="button" variant="outline" asChild className="h-11 rounded-xl">
                        <a href={`${botUrl}?start=${telegramLinkCode || ""}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" /> Ботты ашу
                        </a>
                      </Button>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Ботта Start басыңыз. Егер автоматты авторизация болмаса, осы ID-ді ботқа жіберіңіз. Байланыс орнағаннан кейін төмендегі chat ID автоматты толтырылады.
                    </p>
                    <Input value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} className="mt-3 h-11 rounded-xl" placeholder="Telegram chat ID автоматты толады немесе қолмен енгізіңіз" />
                  </div>
                )}
              </div>
              <div className="mt-5 space-y-3">
                {reminderTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="grid gap-3 rounded-2xl border border-border/70 p-3 sm:grid-cols-[1fr_120px_auto] sm:items-center">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Input value={reminderTimes[item.key]} onChange={(e) => setReminderTimes((current) => ({ ...current, [item.key]: e.target.value }))} type="time" className="h-10 rounded-xl" />
                      <Switch checked={reminders[item.key]} onCheckedChange={(checked) => setReminders((current) => ({ ...current, [item.key]: checked }))} />
                    </div>
                  );
                })}
              </div>
              <Button onClick={savePlan} disabled={loading} className="mt-5 h-11 rounded-xl gradient-medical text-primary-foreground">
                <Save className="mr-2 h-4 w-4" /> Ескертулерді сақтау
              </Button>
            </section>

            <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-card">
              <h2 className="font-semibold">Соңғы in-app хабарламалар</h2>
              <div className="mt-4 space-y-3">
                {inAppNotifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Әзірге хабарлама жоқ. Ескертулер сақталғаннан кейін scheduler оларды толтырады.</p>
                ) : inAppNotifications.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{item.title}</p>
                      <span className="text-xs text-muted-foreground">{item.status}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium">{label}</span>
    {children}
  </label>
);

const Metric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
    <Icon className="h-4 w-4 text-primary" />
    <p className="mt-2 text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-semibold">{value}</p>
  </div>
);

const Macro = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl bg-secondary/70 p-3">
    <p className="text-lg font-semibold">{value}г</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const ToggleRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 p-3">
    <span className="text-sm font-medium">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default LifestylePage;
