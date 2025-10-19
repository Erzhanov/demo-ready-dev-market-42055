import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useWebsite } from "@/hooks/useWebsites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, ShoppingCart, ArrowLeft } from "lucide-react";

const WebsiteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: website, isLoading } = useWebsite(id || "");

  const handlePurchase = () => {
    // Instagram парақшасына жіберу
    window.open('https://www.instagram.com/the.dosik55', '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="mb-8 aspect-video w-full" />
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="mb-4 h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Сайт табылмады</h1>
          <Button asChild>
            <Link to="/">Басты бетке оралу</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Артқа
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              {website.image_url ? (
                <img 
                  src={website.image_url} 
                  alt={website.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary-glow/10">
                  <span className="text-6xl font-bold text-primary/20">
                    {website.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold">{website.title}</h1>
              <Badge variant="secondary">{website.categories?.name || "Басқа"}</Badge>
            </div>

            <p className="mb-6 text-lg text-muted-foreground">{website.description}</p>

            <div className="mb-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">${website.price}</span>
              <Button variant="outline" asChild>
                <a href={website.demo_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Демо-нұсқа
                </a>
              </Button>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-accent to-accent hover:opacity-90"
              onClick={handlePurchase}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Сатып алу
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetail;
