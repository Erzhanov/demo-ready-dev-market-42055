import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BarChart3, Crown, Globe, HeartPulse, History, LogOut, Menu, MessageCircle, MessageSquare, Search, Stethoscope, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useProStatus } from "@/hooks/use-pro-status";
import { useLanguage } from "@/contexts/LanguageContext";
import { WelcomeProDialog } from "@/components/WelcomeProDialog";
import { ExpiredProDialog } from "@/components/ExpiredProDialog";

interface LayoutProps {
  children: React.ReactNode;
}

const getNavItems = (isPro: boolean, t: (k: string) => string) => [
  { path: "/chat", label: t("nav.help"), icon: MessageSquare },
  { path: "/history", label: t("nav.history"), icon: History },
  { path: "/medicine", label: t("nav.medicine"), icon: Search },
  { path: "/lifestyle", label: t("nav.lifestyle"), icon: HeartPulse },
  { path: "/reviews", label: t("nav.reviews"), icon: MessageCircle },
  { path: "/profile", label: t("nav.profile"), icon: User },
  ...(!isPro ? [{ path: "/pro", label: t("nav.pro"), icon: Crown }] : []),
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { isPro } = useProStatus();
  const { lang, setLang, t } = useLanguage();
  const navItems = getNavItems(isPro, t);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleLang = () => setLang(lang === "kk" ? "ru" : "kk");

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
                {isPro ? t("nav.subtitle.pro") : t("nav.subtitle.free")}
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
                {t("nav.admin")}
              </NavLink>
            )}
            <Button variant="ghost" size="sm" onClick={toggleLang} className="h-9 rounded-xl px-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary">
              <Globe className="mr-1 h-3.5 w-3.5" />
              {lang === "kk" ? "РУС" : "ҚАЗ"}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} className="h-9 rounded-xl px-3 text-sm text-muted-foreground hover:bg-secondary">
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleLang} className="h-9 rounded-xl px-2 text-xs font-semibold">
              <Globe className="mr-1 h-3.5 w-3.5" />
              {lang === "kk" ? "РУС" : "ҚАЗ"}
            </Button>
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
              <p className="text-sm font-semibold">{t("nav.menu")}</p>
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
                  {t("nav.admin")}
                </NavLink>
              )}
              <Button variant="outline" onClick={handleLogout} className="mt-3 w-full justify-start rounded-xl text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-3 py-3 pb-5 sm:px-6 sm:py-5">{children}</main>
      <WelcomeProDialog />
      <ExpiredProDialog />
    </div>
  );
};

export default Layout;
