import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Sun, Moon, Bell, Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/lib/i18n";

export function Topbar() {
  const { t } = useT();
  const [light, setLight] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isLight = stored === "light";
    document.documentElement.classList.toggle("light", isLight);
    setLight(isLight);
  }, []);

  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/catalog", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger />
      <Link to="/" className="hidden items-center gap-2 md:flex">
        <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-neon text-primary-foreground">
          <Gamepad2 className="h-3.5 w-3.5" />
        </div>
        <span className="font-display text-sm font-bold tracking-tight">PREÇORAMA</span>
      </Link>
      <form onSubmit={submit} className="relative flex-1 md:max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("top.search")}
          className="h-9 border-border/60 bg-card/60 pl-9 backdrop-blur focus-visible:ring-primary/40"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
          /
        </kbd>
      </form>
      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t("top.toggleTheme")}>
          {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" aria-label={t("top.notifications")}>
          <Bell className="h-4 w-4" />
        </Button>
        <Button asChild size="sm" className="ml-2 gradient-neon text-primary-foreground hover:opacity-90">
          <Link to="/register">{t("top.join")}</Link>
        </Button>
      </div>
    </header>
  );
}
