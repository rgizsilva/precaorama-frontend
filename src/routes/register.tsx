import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Criar conta — PREÇORAMA" }] }),
  component: Register,
});

function Register() {
  const { t } = useT();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error(t("auth.allRequired"));
    toast.success(t("auth.createdToast"));
    nav({ to: "/" });
  };
  return <AuthShell title={t("auth.create")} subtitle={t("auth.createSub")}>
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label>{t("auth.name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Collector" /></div>
      <div className="space-y-1.5"><Label>{t("auth.email")}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@domain.com" /></div>
      <div className="space-y-1.5"><Label>{t("auth.password")}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
      <Button type="submit" className="w-full bg-gold text-gold-foreground hover:bg-gold/90">{t("auth.create")}</Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("auth.haveAccount")} <Link to="/login" className="text-primary hover:underline">{t("auth.signin")}</Link>
      </p>
    </form>
  </AuthShell>;
}
