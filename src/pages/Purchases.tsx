import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Purchase {
  id: string;
  purchased_at: string;
  websites: {
    id: string;
    title: string;
    description: string;
    demo_url: string;
    full_url: string;
    image_url: string | null;
    price: number;
  };
}

const Purchases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchPurchases = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Кіру қажет",
          description: "Сатып алуларды көру үшін жүйеге кіріңіз",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("purchases")
          .select(`
            id,
            purchased_at,
            websites (
              id,
              title,
              description,
              demo_url,
              full_url,
              image_url,
              price
            )
          `)
          .eq("user_id", user.id)
          .order("purchased_at", { ascending: false });

        if (error) throw error;
        setPurchases(data as Purchase[]);
      } catch (error) {
        console.error("Error fetching purchases:", error);
        toast({
          title: "Қате",
          description: "Сатып алуларды жүктеу кезінде қате орын алды",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchPurchases();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <h1 className="mb-8 text-4xl font-bold">Менің Сатып Алуларым</h1>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">Сіз әлі ештеңе сатып алмадыңыз</p>
            <Button onClick={() => navigate("/")}>Сайттарды шолу</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <div className="aspect-video overflow-hidden bg-muted">
                  {purchase.websites.image_url ? (
                    <img 
                      src={purchase.websites.image_url} 
                      alt={purchase.websites.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary-glow/10">
                      <span className="text-4xl font-bold text-primary/20">
                        {purchase.websites.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{purchase.websites.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {purchase.websites.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={purchase.websites.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Демо-нұсқа
                    </a>
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-accent to-accent hover:opacity-90" asChild>
                    <a href={purchase.websites.full_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Толық нұсқа
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
