import { createFileRoute, Link } from "@tanstack/react-router";
import { Library, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  products, getCollection, removeOwned, priceFor, formatPrice, type CollectionEntry,
} from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/collection")({
  head: () => ({ meta: [{ title: "Minha coleção — PREÇORAMA" }] }),
  component: CollectionPage,
});

function CollectionPage() {
  const { t } = useT();
  const [entries, setEntries] = useState<Record<string, CollectionEntry>>({});

  useEffect(() => {
    const refresh = () => setEntries(getCollection());
    refresh();
    window.addEventListener("pr:collection", refresh);
    return () => window.removeEventListener("pr:collection", refresh);
  }, []);

  const items = products.filter((p) => entries[p.id]);
  const total = items.reduce((a, p) => a + priceFor(p, entries[p.id].conditionKey), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{t("col.eyebrow")}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{t("col.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("col.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("col.owned")} value={items.length.toString()} icon={Library} accent="primary" />
        <StatCard label={t("col.value")} value={formatPrice(total)} accent="gold" />
        <StatCard label={t("col.cats")} value={new Set(items.map((p) => p.categoryId)).size.toString()} />
        <StatCard label={t("col.grails")} value={items.filter((p) => p.rarity === "grail").length.toString()} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/50 p-12 text-center backdrop-blur">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Library className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 font-display font-semibold">{t("col.empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("col.emptySub")}</p>
          <Link to="/catalog" className="mt-4 inline-block rounded-md gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {t("col.browse")}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t("tbl.item")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tbl.condition")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tbl.value")}</th>
                <th className="px-4 py-2.5 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((p) => {
                const c = p.conditions.find((x) => x.key === entries[p.id].conditionKey);
                return (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link to="/products/$slug" params={{ slug: p.slug }} className="flex items-center gap-3">
                        <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover ring-1 ring-border/60" />
                        <span className="font-medium hover:text-primary">{p.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs">{c?.label ?? "—"}</td>
                    <td className="px-4 py-3 num font-semibold text-primary">
                      {formatPrice(priceFor(p, entries[p.id].conditionKey))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { removeOwned(p.id); toast(t("col.removed")); }}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
