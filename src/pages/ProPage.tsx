import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Crown, CreditCard, ExternalLink, Infinity, MessageSquare, ShieldCheck, Sparkles, Zap } from "lucide-react";

type SubscriptionPlan = "free" | "pro";

const benefits = [
  {
    title: "Лимитсіз сұрақ",
    text: "Pro қолданушылар қанша сұрақ қойса да болады. Free жоспарында 12 сағатқа 5 сұрақ беріледі.",
    icon: Infinity,
  },
  {
    title: "Толығырақ жауап",
    text: "Pro режимінде AI жауапты кеңірек түсіндіреді: себептер, қадамдар, қауіп белгілері және келесі әрекеттер.",
    icon: MessageSquare,
  },
  {
    title: "Күштірек AI режимі",
    text: "Free жауап қысқа және жалпы бағыт береді, ал Pro жауабы тереңірек әрі практикалық болады.",
    icon: Zap,
  },
  {
    title: "Қауіпсіз кеңес",
    text: "Медициналық сұрақтарда AI диагноз қоймайды, бірақ маңызды жағдайда дәрігерге қаралуды ескертеді.",
    icon: ShieldCheck,
  },
];

const ProPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [proExpiresAt, setProExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadSubscription = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("subscription_plan, pro_expires_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      const expiresAt = data?.pro_expires_at ? new Date(data.pro_expires_at).getTime() : null;
      const activePro = data?.subscription_plan === "pro" && (!expiresAt || expiresAt > Date.now());
      setPlan(activePro ? "pro" : "free");
      setProExpiresAt(data?.pro_expires_at ?? null);
      setLoading(false);
    };

    void loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handlePayment = async () => {
    if (checkoutLoading) return;

    setCheckoutLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Алдымен аккаунтқа кіріңіз.");
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-pro-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ origin: window.location.origin }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || typeof data.url !== "string") {
        throw new Error(data.error || "Төлем бетін ашу мүмкін болмады.");
      }

      window.location.assign(data.url);
    } catch (error) {
      toast({
        title: "Төлем қатесі",
        description: error instanceof Error ? error.message : "Төлем бетін ашу мүмкін болмады.",
        variant: "destructive",
      });
      setCheckoutLoading(false);
    }
  };

  const expiresLabel = proExpiresAt
    ? new Date(proExpiresAt).toLocaleDateString("kk-KZ", { year: "numeric", month: "long", day: "numeric" })
    : "мерзімсіз";

  return (
    <Layout>
      <div className="space-y-5 pb-8">
        <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                <Crown className="h-4 w-4" />
                AIZHAN Pro
              </div>
              <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Лимитсіз және толық жауап беретін Pro режим
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Pro жазылымы AI-ды күнделікті көмекші ретінде жиі қолданатын адамдарға арналған. Бағасы 4990 тг / ай, сұрақ санына шектеу жоқ.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {plan === "pro" ? (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Pro белсенді: {expiresLabel} дейін
                  </div>
                ) : (
                  <Button onClick={handlePayment} disabled={checkoutLoading} className="h-12 rounded-2xl gradient-medical px-6 text-base font-semibold text-primary-foreground">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {checkoutLoading ? "Төлем ашылуда..." : "4990 тг төлеу"}
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => window.location.assign("/chat")} className="h-12 rounded-2xl px-6">
                  Чатқа өту
                </Button>
              </div>
            </div>

            <div className="border-t border-border/80 bg-secondary/40 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="rounded-3xl border border-border/70 bg-background p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Бағасы</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-4xl font-semibold">4990 тг</span>
                  <span className="pb-1 text-sm text-muted-foreground">/ ай</span>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Лимитсіз AI сұрақ
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Толық әрі терең жауап
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Медициналық қауіпсіздік ескертулері
                  </div>
                </div>
                {!loading && plan !== "pro" && (
                  <Button onClick={handlePayment} disabled={checkoutLoading} variant="outline" className="mt-5 h-11 w-full rounded-2xl">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {checkoutLoading ? "Ашылуда..." : "Төлем бетіне өту"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article key={benefit.title} className="rounded-3xl border border-border/80 bg-card p-5 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="mt-4 text-base font-semibold">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.text}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-card sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-medical">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Free пен Pro айырмашылығы</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Free жоспарында AI қысқа, негізгі бағыттағы жауап береді және 12 сағатқа 5 сұрақпен шектеледі. Pro жоспарында сұрақ саны шектелмейді, жауаптар толық, нақтырақ және қолдануға ыңғайлы құрылыммен беріледі.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProPage;
