import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { WebsiteCard } from "@/components/WebsiteCard";
import { useWebsites } from "@/hooks/useWebsites";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const { data: websites, isLoading: websitesLoading } = useWebsites(selectedCategory);
  const { data: categories } = useCategories();
  const { t } = useLanguage();

  const filteredWebsites = useMemo(() => {
    if (!websites) return [];
    
    let filtered = [...websites];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (website) =>
          website.title.toLowerCase().includes(query) ||
          website.description.toLowerCase().includes(query)
      );
    }

    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "priceLow":
          return Number(a.price) - Number(b.price);
        case "priceHigh":
          return Number(b.price) - Number(a.price);
        default:
          return 0;
      }
    });

    return sorted;
  }, [websites, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero onSearch={setSearchQuery} />
      
      <section className="container py-12">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="mb-6 text-3xl font-bold">{t.categories.title}</h2>
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories || []}
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] rounded-2xl border-primary/20 bg-white/80 backdrop-blur-md">
              <SelectValue placeholder={t.sort.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t.sort.newest}</SelectItem>
              <SelectItem value="oldest">{t.sort.oldest}</SelectItem>
              <SelectItem value="priceLow">{t.sort.priceLow}</SelectItem>
              <SelectItem value="priceHigh">{t.sort.priceHigh}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {websitesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : filteredWebsites && filteredWebsites.length > 0 ? (
            filteredWebsites.map((website) => (
              <WebsiteCard 
                key={website.id} 
                id={website.id}
                title={website.title}
                description={website.description}
                price={Number(website.price)}
                imageUrl={website.image_url || undefined}
                category={website.categories?.name || "Other"}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No websites found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
