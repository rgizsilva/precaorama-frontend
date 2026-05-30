import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Star, Activity, TrendingDown, TrendingUp, DollarSign, Library, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PriceChart } from "@/components/price-chart";
import { StatCard } from "@/components/stat-card";
import { ProductCard } from "@/components/product-card";
import { TimeAgo } from "@/components/time-ago";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  formatPrice, getCategory, getProduct, isWatched, toggleWatchlist, trendPct,
  topPrice, loosePrice, avgPrice, lowPrice, highPrice, volatility, priceFor,
  relatedProducts, setOwned, removeOwned, getCollection,
} from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.title} — Price · PREÇORAMA` },
      { name: "description", content: loaderData.product.description },
      { property: "og:title", content: loaderData.product.title },
      { property: "og:description", content: loaderData.product.description },
      { property: "og:image", content: loaderData.product.imageUrl },
      { name: "twitter:image", content: loaderData.product.imageUrl },
    ] : [],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { t } = useT();
  const { product } = Route.useLoaderData();
  const [range, setRange] = useState<"30d" | "90d" | "180d">("180d");
  const [watched, setWatched] = useState(false);
  const [owned, setOwnedState] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setWatched(isWatched(product.id));
    setOwnedState(getCollection()[product.id]?.conditionKey ?? null);
    const w = () => setWatched(isWatched(product.id));
    const c = () => setOwnedState(getCollection()[product.id]?.conditionKey ?? null);
    window.addEventListener("pr:watchlist", w);
    window.addEventListener("pr:collection", c);
    return () => {
      window.removeEventListener("pr:watchlist", w);
      window.removeEventListener("pr:collection", c);
    };
  }, [product.id]);

  const trend = trendPct(product);
  const positive = trend >= 0;
  const cat = getCategory(product.categoryId);
  const days = range === "30d" ? 30 : range === "90d" ? 90 : 180;
  const sliced = product.history.slice(-days);
  const related = relatedProducts(product);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <nav className="text-xs text-muted-foreground">
        <Link to="/catalog" className="hover:text-primary">{t("nav.catalog")}</Link>
        <span className="mx-1.5">/</span>
        <Link to="/catalog" search={{ cat: cat?.slug } as never} className="hover:text-primary">{cat?.icon} {cat?.name}</Link>
        {product.platform && (<><span className="mx-1.5">/</span><span>{product.platform}</span></>)}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <img src={product.gallery[activeImg] || product.imageUrl} alt={product.title} className="relative aspect-square w-full object-cover" />
          </div>
          {product.gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.gallery.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-md border bg-card/40",
                    i === activeImg ? "border-primary" : "border-border/40 opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-primary">
                {cat?.icon} {cat?.name}
              </span>
              {product.platform && (
                <span className="rounded-md border border-border/60 bg-card/60 px-2 py-0.5 text-[11px] font-medium">
                  {product.platform}
                </span>
              )}
              {product.franchise && (
                <span className="rounded-md border border-border/60 bg-card/60 px-2 py-0.5 text-[11px] font-medium">
                  {product.franchise}
                </span>
              )}
              {product.releaseYear && (
                <span className="rounded-md border border-border/60 bg-card/60 px-2 py-0.5 text-[11px] font-medium num">
                  {product.releaseYear}
                </span>
              )}
              {product.rarity === "grail" && (
                <span className="rounded-md gradient-gold px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-foreground">
                  {t("prod.grail")}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">{product.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
          </div>

          {/* Condition price grid — the core PriceCharting layout */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("prod.marketByCondition")}</h2>
              <span className="text-[10px] text-muted-foreground">{t("prod.updated")} <TimeAgo iso={product.updatedAt} /></span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {product.conditions.map((c: import("@/lib/mock-data").Condition, i: number) => {
                const isTop = i === product.conditions.length - 1;
                return (
                  <div key={c.key} className={cn(
                    "rounded-lg border p-3 transition-all",
                    isTop ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background/40",
                  )}>
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    <div className={cn("mt-1 font-display text-lg font-bold num", isTop && "text-primary")}>
                      {formatPrice(priceFor(product, c.key))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 border-y border-border/60 py-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("prod.topValue")}</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold num">{formatPrice(topPrice(product))}</span>
                <span className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-sm font-medium num",
                  positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                )}>
                  {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(trend).toFixed(1)}% · 30d
                </span>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                variant={watched ? "default" : "outline"}
                onClick={() => {
                  const next = toggleWatchlist(product.id);
                  setWatched(next);
                  toast(next ? t("prod.addedWish") : t("prod.removedWish"));
                }}
                className={cn(watched && "gradient-gold text-gold-foreground hover:opacity-90")}
              >
                <Star className={cn("h-4 w-4", watched && "fill-current")} />
                {watched ? t("prod.watching") : t("prod.wishlist")}
              </Button>
              <CollectButton product={product} owned={owned} setOwned={setOwnedState} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label={t("prod.stat.loose")} value={formatPrice(loosePrice(product))} icon={DollarSign} />
            <StatCard label={t("prod.stat.average")} value={formatPrice(avgPrice(product))} icon={DollarSign} />
            <StatCard label={t("prod.stat.atl")} value={formatPrice(lowPrice(product))} icon={TrendingDown} />
            <StatCard label={t("prod.stat.ath")} value={formatPrice(highPrice(product))} icon={TrendingUp} accent="gold" />
            <StatCard label={t("prod.stat.volatility")} value={`${volatility(product)}%`} icon={Activity} />
            <StatCard label={t("prod.stat.rarity")} value={product.rarity.replace("-", " ")} accent="primary" />
            <StatCard label={t("prod.stat.region")} value={product.region ?? "—"} />
            <StatCard label={t("prod.stat.year")} value={(product.releaseYear ?? "—").toString()} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold">{t("prod.histTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("prod.histSub", { n: days })}</p>
          </div>
          <Tabs value={range} onValueChange={(v) => setRange(v as never)}>
            <TabsList className="h-8 bg-background/60">
              <TabsTrigger value="30d" className="h-7 px-3 text-xs">30D</TabsTrigger>
              <TabsTrigger value="90d" className="h-7 px-3 text-xs">90D</TabsTrigger>
              <TabsTrigger value="180d" className="h-7 px-3 text-xs">180D</TabsTrigger>
            </TabsList>
            <TabsContent value={range} />
          </Tabs>
        </div>
        <PriceChart data={sliced} height={320} />
      </div>

      {/* Recent sold */}
      <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur">
        <div className="border-b border-border/60 px-5 py-3">
          <h2 className="font-display text-base font-semibold">{t("prod.recentSold")}</h2>
          <p className="text-xs text-muted-foreground">{t("prod.recentSoldSub")}</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 font-medium">{t("tbl.date")}</th>
              <th className="px-5 py-2.5 font-medium">{t("tbl.condition")}</th>
              <th className="px-5 py-2.5 font-medium">{t("tbl.price")}</th>
              <th className="px-5 py-2.5 font-medium text-right">{t("tbl.source")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {product.recentSold.map((s: import("@/lib/mock-data").SoldListing) => (
              <tr key={s.id} className="hover:bg-muted/20">
                <td className="px-5 py-2.5 text-muted-foreground">{new Date(s.date).toLocaleDateString()}</td>
                <td className="px-5 py-2.5 text-xs">{s.condition}</td>
                <td className="px-5 py-2.5 num font-semibold text-primary">{formatPrice(s.price)}</td>
                <td className="px-5 py-2.5 text-right text-xs text-muted-foreground">{s.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">{t("prod.related")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function CollectButton({ product, owned, setOwned: setOwnedState }: {
  product: ReturnType<typeof getProduct> & object;
  owned: string | null;
  setOwned: (v: string | null) => void;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  if (owned) {
    const c = product.conditions.find((x) => x.key === owned);
    return (
      <Button
        variant="default"
        className="gradient-neon text-primary-foreground hover:opacity-90"
        onClick={() => { removeOwned(product.id); setOwnedState(null); toast(t("prod.removedCol")); }}
      >
        <Check className="h-4 w-4" /> {t("prod.owned")} · {c?.label}
      </Button>
    );
  }
  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((v) => !v)}>
        <Library className="h-4 w-4" /> {t("prod.addCollection")}
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border border-border/60 bg-popover/95 shadow-xl backdrop-blur">
          {product.conditions.map((c: import("@/lib/mock-data").Condition) => (
            <button
              key={c.key}
              onClick={() => {
                setOwned(product.id, c.key);
                setOwnedState(c.key);
                setOpen(false);
                toast.success(`${t("prod.added")} · ${c.label}`);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/40"
            >
              <span>{c.label}</span>
              <span className="num text-xs text-muted-foreground">{formatPrice(priceFor(product, c.key))}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
