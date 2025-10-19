import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const { t } = useLanguage();
  
  return (
    <section className="relative overflow-hidden py-32 md:py-40">
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 30% 50%, hsl(210 100% 85% / 0.3), transparent 50%), radial-gradient(circle at 70% 50%, hsl(200 100% 85% / 0.3), transparent 50%)',
        }}
      />
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-block rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-primary">✨ Liquid Glass Design</span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            {t.hero.title}
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t.hero.subtitle}
            </span>
          </h1>
          
          <div className="mx-auto max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/60" />
              <Input 
                placeholder={t.hero.searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="h-14 rounded-2xl border-primary/20 bg-white/80 pl-12 backdrop-blur-md transition-all hover:bg-white/90 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};
