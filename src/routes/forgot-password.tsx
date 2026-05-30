import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Redefinir senha — PREÇORAMA" }] }),
  component: Forgot,
});

function Forgot() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error(t("auth.enterEmail"));
    toast.success(t("auth.resetSent"));
  };
  return <AuthShell title={t("auth.resetTitle")} subtitle={t("auth.resetSub")}>
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label>{t("auth.email")}</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" /></div>
      <Button type="submit" className="w-full bg-gold text-gold-foreground hover:bg-gold/90">{t("auth.sendReset")}</Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("auth.remembered")} <Link to="/login" className="text-primary hover:underline">{t("auth.signin")}</Link>
      </p>
    </form>
  </AuthShell>;
}
