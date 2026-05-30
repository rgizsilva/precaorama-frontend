import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { products, getWatchlist } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [{ title: "Lista de desejos — PREÇORAMA" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { t } = useT();
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => setIds(getWatchlist());
    refresh();
    window.addEventListener("pr:watchlist", refresh);
    return () => window.removeEventListener("pr:watchlist", refresh);
  }, []);

  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">{t("wish.eyebrow")}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{t("wish.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} {t("wish.itemsTracked")}</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/50 p-12 text-center backdrop-blur">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
            <Star className="h-5 w-5 text-gold" />
          </div>
          <p className="mt-3 font-display font-semibold">{t("wish.empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("wish.emptySub")}</p>
          <Link to="/catalog" className="mt-4 inline-block rounded-md gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {t("col.browse")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
