import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — PREÇORAMA" }] }),
  component: Login,
});

function Login() {
  const { t } = useT();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error(t("auth.fillBoth"));
    toast.success(t("auth.welcomeToast"));
    nav({ to: "/" });
  };
  return <AuthShell title={t("auth.welcomeBack")} subtitle={t("auth.welcomeSub")}>
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label>{t("auth.email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" /></div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{t("auth.password")}</Label>
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("auth.forgot")}</Link>
        </div>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button type="submit" className="w-full gradient-neon text-primary-foreground hover:opacity-90">{t("auth.signin")}</Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("auth.noAccount")} <Link to="/register" className="text-primary hover:underline">{t("auth.create")}</Link>
      </p>
    </form>
  </AuthShell>;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { t } = useT();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md gradient-neon text-primary-foreground glow-neon">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold">PREÇORAMA</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">{t("sidebar.tagline")}</div>
          </div>
        </Link>
        <div className="relative">
          <p className="font-display text-3xl font-bold leading-tight">
            {t("auth.shellTagline1")} <span className="text-primary">{t("auth.shellTagline2")}</span>, <span className="text-primary">{t("auth.shellTagline3")}</span>, <span className="text-gold">{t("auth.shellTagline4")}</span>.
          </p>
          <p className="mt-3 max-w-md text-sm text-sidebar-foreground/70">
            {t("auth.shellSub")}
          </p>
        </div>
        <p className="relative text-[11px] text-sidebar-foreground/50">© PREÇORAMA · {t("auth.demoMode")}</p>
      </div>
      <div className="flex flex-col items-center justify-center p-6">
        <div className="absolute right-4 top-4"><LanguageSwitcher /></div>
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
