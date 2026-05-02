import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BarChart3, Crown, HeartPulse, History, LogOut, Menu, MessageCircle, MessageSquare, Search, Stethoscope, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useProStatus } from "@/hooks/use-pro-status";

interface LayoutProps {
  children: React.ReactNode;
}

const getNavItems = (isPro: boolean) => [
  { path: "/chat", label: "Көмек", icon: MessageSquare },
  { path: "/history", label: "Тарих", icon: History },
  { path: "/medicine", label: "Дәрі", icon: Search },
  { path: "/lifestyle", label: "Lifestyle", icon: HeartPulse },
  { path: "/reviews", label: "Пікір", icon: MessageCircle },
  { path: "/profile", label: "Профиль", icon: User },
  ...(!isPro ? [{ path: "/pro", label: "Pro", icon: Crown }] : []),
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isPro } = useProStatus();
  const navItems = getNavItems(isPro);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          <NavLink to="/chat" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-medical shadow-card">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">AIZHAN</p>
                {isPro && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    <Crown className="h-3 w-3" />
                    PRO
                  </span>
                )}
              </div>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                {isPro ? "Pro медициналық көмекші — лимитсіз" : "Қарапайым медициналық көмекші"}
              </p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all ${
                    isActive ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all ${
                  location.pathname === "/admin" ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Админ
              </NavLink>
            )}
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} className="h-9 rounded-xl px-3 text-sm text-muted-foreground hover:bg-secondary">
              <LogOut className="mr-2 h-4 w-4" />
              Шығу
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="rounded-xl hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-black/25" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[280px] surface-soft p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Мәзір</p>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm ${
                      isActive ? "bg-primary text-primary-foreground shadow-card" : "bg-secondary/60 text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-3 text-sm text-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Админ
                </NavLink>
              )}
              <Button variant="outline" onClick={handleLogout} className="mt-3 w-full justify-start rounded-xl text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                Шығу
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-3 py-3 pb-5 sm:px-6 sm:py-5">{children}</main>

    </div>
  );
};

export default Layout;
