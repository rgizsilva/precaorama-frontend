import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Package, Activity, Flame, ArrowRight, Sparkles } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PriceChart } from "@/components/price-chart";
import { ProductCard } from "@/components/product-card";
import { TimeAgo } from "@/components/time-ago";
import {
  products, formatPrice, trendPct, topPrice, avgPrice, volatility, categories,
} from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PREÇORAMA — Collectible Price Index" },
      { name: "description", content: "Track real-time prices for retro games, Pokémon cards, Yu-Gi-Oh!, Funko Pops and geek collectibles. Loose, CIB, sealed, graded — historical charts and recent sales." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useT();
  const indexValue = products.reduce((a, p) => a + topPrice(p), 0);
  const sorted = [...products].sort((a, b) => trendPct(b) - trendPct(a));
  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();
  const trending = [...products].sort((a, b) => volatility(b) - volatility(a)).slice(0, 4);
  const recentSold = products
    .flatMap((p) => p.recentSold.slice(0, 1).map((s) => ({ s, p })))
    .sort((a, b) => (a.s.date < b.s.date ? 1 : -1))
    .slice(0, 8);

  // Aggregate index — average normalized price
  const indexSeries = products[0].history.map((_, i) => {
    const avg = products.reduce((a, p) => a + p.history[i].price / avgPrice(p), 0) / products.length;
    return { date: products[0].history[i].date, price: Math.round(avg * 1000) / 10 };
  });

  const indexTrend = ((indexSeries[indexSeries.length - 1].price - indexSeries[indexSeries.length - 31].price) / indexSeries[indexSeries.length - 31].price) * 100;

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" /> {t("home.live")} · {products.length} {t("home.trackedItems")}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {t("home.heroTitle1")} <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">{t("home.heroTitle2")}</span>.
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                {t("home.heroSubtitle")}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/catalog" className="inline-flex items-center gap-1 rounded-md gradient-neon px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  {t("home.browseCatalog")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/watchlist" className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium backdrop-blur hover:border-primary/40">
                  {t("home.myWishlist")}
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("home.indexTitle")}</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold num">{indexSeries[indexSeries.length - 1].price.toFixed(1)}</span>
                <span className={`text-sm font-semibold num ${indexTrend >= 0 ? "text-success" : "text-destructive"}`}>
                  {indexTrend >= 0 ? "+" : ""}{indexTrend.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 -mx-2 w-[260px]">
                <PriceChart data={indexSeries.slice(-90)} height={80} compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label={t("home.stat.tracked")} value={products.length.toString()} icon={Package} accent="primary" hint={`${categories.length} ${t("home.stat.categories")}`} />
          <StatCard label={t("home.stat.marketCap")} value={formatPrice(indexValue)} delta={4.7} icon={TrendingUp} accent="gold" />
          <StatCard label={t("home.stat.topMover")} value={`+${trendPct(gainers[0]).toFixed(1)}%`} delta={trendPct(gainers[0])} icon={Flame} hint={gainers[0].title.slice(0, 30)} />
          <StatCard label={t("home.stat.volatility")} value={`${Math.round(products.reduce((a, p) => a + volatility(p), 0) / products.length)}%`} icon={Activity} />
        </div>

        {/* Featured collections */}
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">{t("home.featured")}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((c) => {
              const items = products.filter((p) => p.categoryId === c.id);
              const total = items.reduce((a, p) => a + topPrice(p), 0);
              return (
                <Link
                  key={c.id}
                  to="/catalog"
                  search={{ cat: c.slug } as never}
                  className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <div className="text-2xl">{c.icon}</div>
                  <div className="mt-3 font-display text-sm font-semibold">{c.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{items.length} {t("home.items")} · {formatPrice(total)}</div>
                  <ArrowRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-all group-hover:right-3 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top risers / drops */}
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/50 p-5 backdrop-blur lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-semibold">{t("home.marketIndex")}</h2>
                <p className="text-xs text-muted-foreground">{t("home.marketIndexSub")}</p>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium num ${indexTrend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {indexTrend >= 0 ? "+" : ""}{indexTrend.toFixed(1)}%
              </span>
            </div>
            <PriceChart data={indexSeries} height={260} />
          </div>
          <div className="space-y-4">
            <MoverList title={t("home.risers")} icon={TrendingUp} items={gainers} tone="success" />
            <MoverList title={t("home.drops")} icon={TrendingDown} items={losers} tone="destructive" />
          </div>
        </section>

        {/* Trending */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">{t("home.trending")}</h2>
              <p className="text-xs text-muted-foreground">{t("home.trendingSub")}</p>
            </div>
            <Link to="/catalog" className="text-xs font-medium text-primary hover:underline">{t("home.viewAll")}</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Recent sales */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">{t("home.recentSales")}</h2>
              <p className="text-xs text-muted-foreground">{t("home.recentSalesSub")}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t("tbl.item")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("tbl.condition")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("tbl.sold")}</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">{t("tbl.source")}</th>
                  <th className="px-4 py-2.5 font-medium text-right">{t("tbl.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentSold.map(({ s, p }) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link to="/products/$slug" params={{ slug: p.slug }} className="flex items-center gap-3">
                        <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover ring-1 ring-border/60" />
                        <span className="font-medium hover:text-primary">{p.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{s.condition}</td>
                    <td className="px-4 py-3 num font-semibold text-primary">{formatPrice(s.price)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{s.source}</td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      <TimeAgo iso={s.date + "T12:00:00Z"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function MoverList({ title, icon: Icon, items, tone }: {
  title: string; icon: typeof TrendingUp; items: typeof products; tone: "success" | "destructive";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${tone === "success" ? "text-success" : "text-destructive"}`} />
        <h3 className="font-display text-sm font-semibold">{title}</h3>
      </div>
      <ul className="space-y-1">
        {items.map((p) => {
          const t = trendPct(p);
          return (
            <li key={p.id}>
              <Link to="/products/$slug" params={{ slug: p.slug }} className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-muted/40">
                <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover ring-1 ring-border/60" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{p.title}</div>
                  <div className="text-[10px] text-muted-foreground num">{formatPrice(topPrice(p))}</div>
                </div>
                <span className={`shrink-0 num text-xs font-semibold ${tone === "success" ? "text-success" : "text-destructive"}`}>
                  {t >= 0 ? "+" : ""}{t.toFixed(1)}%
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
