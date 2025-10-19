import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Shield, LogOut, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const { data: userRole } = useUserRole();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { itemCount } = useCart();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: t.messages.success,
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DevMarket
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80"
              >
                <Languages className="h-5 w-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border-primary/10">
              <DropdownMenuItem 
                onClick={() => setLanguage('kk')}
                className={language === 'kk' ? 'bg-primary/10 text-primary' : ''}
              >
                🇰🇿 Қазақша
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('ru')}
                className={language === 'ru' ? 'bg-primary/10 text-primary' : ''}
              >
                🇷🇺 Русский
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-primary/10 text-primary' : ''}
              >
                🇬🇧 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <Link to="/cart">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-11 w-11 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 relative"
                >
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-xs">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                className="h-11 w-11 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80"
              >
                <Link to="/purchases">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </Link>
              </Button>
              {userRole === "admin" && (
                <Button 
                  variant="outline" 
                  asChild
                  className="rounded-xl border-primary/20 bg-white/50 backdrop-blur-sm hover:bg-white/80"
                >
                  <Link to="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    {t.navbar.admin}
                  </Link>
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t.navbar.signOut}
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              asChild
              className="rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40"
            >
              <Link to="/auth">
                <User className="mr-2 h-4 w-4" />
                {t.navbar.signIn}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
