import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { useWebsites } from "@/hooks/useWebsites";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  const { data: categories } = useCategories();
  const { data: websites, refetch: refetchWebsites } = useWebsites();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    demo_url: "",
    full_url: "",
    image_url: "",
    category_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Кіру қажет",
          description: "Әкімші панеліне кіру үшін жүйеге кіріңіз",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!roleLoading && userRole !== "admin") {
      toast({
        title: "Қол жетімсіз",
        description: "Бұл бетке тек әкімшілер қол жеткізе алады",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [userRole, roleLoading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const websiteData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        demo_url: formData.demo_url,
        full_url: formData.full_url,
        image_url: formData.image_url || null,
        category_id: formData.category_id || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("websites")
          .update(websiteData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Сәтті!",
          description: "Сайт сәтті жаңартылды",
        });
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from("websites")
          .insert(websiteData);

        if (error) throw error;

        toast({
          title: "Сәтті!",
          description: "Жаңа сайт қосылды",
        });
      }

      setFormData({
        title: "",
        description: "",
        price: "",
        demo_url: "",
        full_url: "",
        image_url: "",
        category_id: "",
      });
      
      refetchWebsites();
    } catch (error: any) {
      console.error("Error saving website:", error);
      toast({
        title: "Қате",
        description: error.message || "Сайтты сақтау кезінде қате орын алды",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (website: any) => {
    setFormData({
      title: website.title,
      description: website.description,
      price: website.price.toString(),
      demo_url: website.demo_url,
      full_url: website.full_url,
      image_url: website.image_url || "",
      category_id: website.category_id || "",
    });
    setEditingId(website.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("websites")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Сәтті!",
        description: "Сайт жойылды",
      });
      
      refetchWebsites();
    } catch (error: any) {
      console.error("Error deleting website:", error);
      toast({
        title: "Қате",
        description: error.message || "Сайтты жою кезінде қате орын алды",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <Skeleton className="mb-4 h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-8 text-4xl font-bold">Әкімші Панелі</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Сайтты Өңдеу" : "Жаңа Сайт Қосу"}</CardTitle>
              <CardDescription>
                Сайт туралы ақпаратты толтырыңыз
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Атауы *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Сипаттамасы *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Бағасы ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Категорияны таңдаңыз" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="demo_url">Демо-нұсқа сілтемесі *</Label>
                  <Input
                    id="demo_url"
                    type="url"
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="full_url">Толық нұсқа сілтемесі *</Label>
                  <Input
                    id="full_url"
                    type="url"
                    value={formData.full_url}
                    onChange={(e) => setFormData({ ...formData, full_url: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">Сурет сілтемесі</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Сақталуда..." : editingId ? "Жаңарту" : "Қосу"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: "",
                          description: "",
                          price: "",
                          demo_url: "",
                          full_url: "",
                          image_url: "",
                          category_id: "",
                        });
                      }}
                    >
                      Болдырмау
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-4 text-2xl font-bold">Барлық Сайттар</h2>
            <div className="space-y-4">
              {websites?.map((website) => (
                <Card key={website.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{website.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {website.description}
                        </CardDescription>
                        <p className="mt-2 text-lg font-semibold text-primary">
                          ${website.price}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(website)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => setDeleteId(website.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сайтты жоюға сенімдісіз бе?</AlertDialogTitle>
            <AlertDialogDescription>
              Бұл әрекетті қайтару мүмкін емес. Сайт толығымен жойылады.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Болдырмау</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Жою</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
