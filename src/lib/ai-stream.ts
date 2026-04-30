const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Msg = { role: "user" | "assistant"; content: string };

export async function streamChat({
  messages,
  mode,
  accessToken,
  onDelta,
  onUsage,
  onDone,
  onError,
}: {
  messages: Msg[];
  mode: string;
  accessToken?: string;
  onDelta: (text: string) => void;
  onUsage?: (usage: {
    remaining: number | null;
    resetAt?: string | null;
    windowHours?: number | null;
    limitExhaustedAt?: string | null;
  }) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, mode }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || `Қате: ${resp.status}`);
      return;
    }

    const data = await resp.json().catch(() => ({}));
    const content = typeof data.content === "string" ? data.content : "";
    if (!content) {
      onError("Жауап бос қайтты");
      return;
    }

    onDelta(content);
    if (data.usage) {
      onUsage?.(data.usage);
    }

    onDone();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Желі қатесі";
    onError(`AI-мен байланыс қатесі: ${msg}`);
  }
}
