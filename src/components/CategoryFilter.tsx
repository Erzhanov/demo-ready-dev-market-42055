import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange, categories }: CategoryFilterProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        onClick={() => onCategoryChange("all")}
        className={
          selectedCategory === "all" 
            ? "rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25" 
            : "rounded-full border-primary/20 bg-white/60 backdrop-blur-sm hover:bg-white/80"
        }
      >
        {t.categories.all}
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
          className={
            selectedCategory === category.id 
              ? "rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25" 
              : "rounded-full border-primary/20 bg-white/60 backdrop-blur-sm hover:bg-white/80"
          }
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
