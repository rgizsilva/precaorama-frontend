import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Grid, List, Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import {
  categories, products, formatPrice, trendPct, topPrice, loosePrice, getCategoryBySlug,
} from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

type CatalogSearch = { q?: string; cat?: string; sort?: string };

export const Route = createFileRoute("/catalog")({
  validateSearch: (s: Record<string, unknown>): CatalogSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catalog — PREÇORAMA" },
      { name: "description", content: "Search and filter the collectible price index by category, platform, franchise, condition." },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { t } = useT();
  const initial = Route.useSearch();
  const [q, setQ] = useState(initial.q ?? "");
  const [catSlug, setCatSlug] = useState(initial.cat ?? "all");
  const [sort, setSort] = useState(initial.sort ?? "trend-desc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const filtered = useMemo(() => {
    let list = products;
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(n) ||
        p.franchise?.toLowerCase().includes(n) ||
        p.platform?.toLowerCase().includes(n),
      );
    }
    if (catSlug !== "all") {
      const c = getCategoryBySlug(catSlug);
      if (c) list = list.filter((p) => p.categoryId === c.id);
    }
    switch (sort) {
      case "price-desc": list = [...list].sort((a, b) => topPrice(b) - topPrice(a)); break;
      case "price-asc": list = [...list].sort((a, b) => topPrice(a) - topPrice(b)); break;
      case "trend-desc": list = [...list].sort((a, b) => trendPct(b) - trendPct(a)); break;
      case "trend-asc": list = [...list].sort((a, b) => trendPct(a) - trendPct(b)); break;
      case "recent": list = [...list].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)); break;
      case "popular": list = [...list].sort((a, b) => topPrice(b) - topPrice(a)); break;
    }
    return list;
  }, [q, catSlug, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCat = catSlug !== "all" ? getCategoryBySlug(catSlug) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">{t("catalog.eyebrow")}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {activeCat ? <>{activeCat.icon} {t(`cat.${activeCat.slug}`)}</> : t("catalog.title")}
        </h1>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        <CatChip active={catSlug === "all"} onClick={() => { setCatSlug("all"); setPage(1); }}>{t("catalog.all")}</CatChip>
        {categories.map((c) => (
          <CatChip key={c.id} active={catSlug === c.slug} onClick={() => { setCatSlug(c.slug); setPage(1); }}>
            <span className="mr-1">{c.icon}</span>{t(`cat.${c.slug}`)}
          </CatChip>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/50 p-3 backdrop-blur md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder={t("catalog.searchPlaceholder")}
            className="h-9 border-border/60 bg-background/60 pl-9"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-9 w-full md:w-48"><SelectValue placeholder={t("catalog.sort")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="trend-desc">{t("catalog.sort.trendDesc")}</SelectItem>
            <SelectItem value="trend-asc">{t("catalog.sort.trendAsc")}</SelectItem>
            <SelectItem value="price-desc">{t("catalog.sort.priceDesc")}</SelectItem>
            <SelectItem value="price-asc">{t("catalog.sort.priceAsc")}</SelectItem>
            <SelectItem value="recent">{t("catalog.sort.recent")}</SelectItem>
            <SelectItem value="popular">{t("catalog.sort.popular")}</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 rounded-md border border-border/60 bg-background/60 p-0.5">
          <Button variant={view === "grid" ? "default" : "ghost"} size="sm" onClick={() => setView("grid")} className="h-8 px-2"><Grid className="h-4 w-4" /></Button>
          <Button variant={view === "list" ? "default" : "ghost"} size="sm" onClick={() => setView("list")} className="h-8 px-2"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? t("catalog.result") : t("catalog.results")}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/50 p-12 text-center">
          <p className="font-display text-base font-semibold">{t("catalog.empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("catalog.emptySub")}</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t("tbl.item")}</th>
                <th className="px-4 py-2.5 font-medium hidden md:table-cell">{t("tbl.platform")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tbl.loose")}</th>
                <th className="px-4 py-2.5 font-medium">{t("tbl.top")}</th>
                <th className="px-4 py-2.5 font-medium">30d</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {visible.map((p) => {
                const t = trendPct(p);
                return (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <Link to="/products/$slug" params={{ slug: p.slug }} className="flex items-center gap-3">
                        <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover ring-1 ring-border/60" />
                        <span className="font-medium hover:text-primary">{p.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{p.platform || p.franchise || "—"}</td>
                    <td className="px-4 py-2.5 num">{formatPrice(loosePrice(p))}</td>
                    <td className="px-4 py-2.5 num font-semibold text-primary">{formatPrice(topPrice(p))}</td>
                    <td className={`px-4 py-2.5 num font-medium ${t >= 0 ? "text-success" : "text-destructive"}`}>
                      {t >= 0 ? "+" : ""}{t.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function CatChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs font-medium transition-all " +
        (active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
