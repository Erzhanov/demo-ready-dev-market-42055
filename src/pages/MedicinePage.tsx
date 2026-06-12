import { useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pill, AlertTriangle, Loader2 } from "lucide-react";
import { streamChat } from "@/lib/ai-stream";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const popularMedicines = ["Парацетамол", "Ибупрофен", "Амоксициллин", "Лоратадин"];

const MedicinePage = () => {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();
  const { t } = useLanguage();

  const handleSearch = async (name?: string) => {
    const query = name || search;
    if (!query.trim()) return;
    if (!session?.access_token) {
      toast({ title: "Қате", description: "Алдымен аккаунтқа кіріңіз.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult("");

    let content = "";
    try {
      await streamChat({
        messages: [{ role: "user", content: `${query} дәрісі туралы қысқа әрі түсінікті ақпарат бер.` }],
        mode: "medicine",
        accessToken: session.access_token,
        onDelta: (fullContent) => {
          content = fullContent;
          setResult(content);
        },
        onDone: () => {
          setIsLoading(false);
          if (user) {
            supabase.from("medicine_searches").insert({ user_id: user.id, query: query.trim() }).then(() => {});
          }
        },
        onError: (err) => {
          toast({ title: "Қате", description: err, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      toast({ title: "Қате", description: "AI қызметімен байланыс орнатылмады", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4 pb-16 md:pb-4">
        <section className="surface-soft rounded-3xl border border-border/80 p-4 ring-soft">
          <h1 className="text-lg font-semibold text-foreground">Дәрі іздеу</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Дәрі атауын жазыңыз. Жауап қысқа және түсінікті түрде беріледі.</p>
        </section>

        <section className="surface-soft rounded-3xl border border-border/80 p-4 ring-soft">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Дәрі атауы"
                className="h-11 rounded-xl border-border/80 bg-white pl-9 text-sm dark:bg-slate-900"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={!search.trim() || isLoading} className="h-11 rounded-xl gradient-medical text-primary-foreground shadow-card">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Іздеу"}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularMedicines.map((med) => (
              <button key={med} onClick={() => { setSearch(med); handleSearch(med); }} className="rounded-full border border-border/80 bg-white px-3 py-1.5 text-sm text-foreground shadow-card dark:bg-slate-900">
                {med}
              </button>
            ))}
          </div>
        </section>

        {isLoading && (!result || result === "") ? (
          <section className="surface-soft rounded-3xl border border-border/80 p-6 ring-soft">
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full gradient-medical shadow-card">
                  <Pill className="h-6 w-6 animate-pulse text-primary-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {t("medicine.searching")}
              </div>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          </section>
        ) : result !== null && result !== "" ? (
          <section className="surface-soft rounded-3xl border border-border/80 p-4 ring-soft">
            <div className="prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <div className="mt-4 flex gap-2 rounded-2xl bg-destructive/5 p-3 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p>Бұл ақпарат тек танысуға арналған. Дәріні қолданбас бұрын маманмен кеңесіңіз.</p>
            </div>
          </section>
        ) : (
          <section className="surface-muted rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground ring-soft">
            Дәрі атауын енгізіңіз немесе жоғарыдағы дайын атаулардың бірін таңдаңыз.
          </section>
        )}
      </div>
    </Layout>
  );
};

export default MedicinePage;
