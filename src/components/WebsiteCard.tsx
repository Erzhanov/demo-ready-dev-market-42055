import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

interface WebsiteCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
}

export const WebsiteCard = ({ 
  id, 
  title, 
  description, 
  price, 
  imageUrl, 
  category 
}: WebsiteCardProps) => {
  const { t } = useLanguage();
  const { addToCart, items } = useCart();
  const isInCart = items.some((item) => item.id === id);
  
  return (
    <Card className="group overflow-hidden rounded-3xl border border-primary/10 bg-white/60 backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-foreground">{title}</CardTitle>
          <Badge 
            variant="secondary" 
            className="rounded-full bg-primary/10 text-primary backdrop-blur-sm"
          >
            {category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${price}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="rounded-xl hover:bg-primary/10"
          >
            <a href="#" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t.websiteCard.viewDemo}
            </a>
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="gap-2">
        <Button 
          variant="outline" 
          className="flex-1 rounded-xl border-primary/20 bg-white/50 backdrop-blur-sm hover:bg-white/80" 
          asChild
        >
          <Link to={`/website/${id}`}>
            {t.websiteCard.viewDetails}
          </Link>
        </Button>
        <Button 
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
          onClick={() => addToCart({ id, title, price, imageUrl })}
          disabled={isInCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isInCart ? t.websiteCard.removeFromCart : t.websiteCard.addToCart}
        </Button>
      </CardFooter>
    </Card>
  );
};
