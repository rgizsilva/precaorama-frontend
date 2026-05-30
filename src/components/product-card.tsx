import { Link } from "@tanstack/react-router";
import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type Product, formatPrice, getCategory, isWatched, loosePrice, topPrice,
  toggleWatchlist, trendPct,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/time-ago";

const rarityRing: Record<Product["rarity"], string> = {
  common: "",
  uncommon: "",
  rare: "ring-1 ring-primary/20",
  "ultra-rare": "ring-1 ring-primary/40 ring-rarity-ultra-rare",
  grail: "ring-1 ring-gold/60 ring-rarity-grail",
};

const rarityLabel: Record<Product["rarity"], { text: string; cls: string }> = {
  common: { text: "Common", cls: "bg-muted text-muted-foreground" },
  uncommon: { text: "Uncommon", cls: "bg-muted text-muted-foreground" },
  rare: { text: "Rare", cls: "bg-primary/15 text-primary" },
  "ultra-rare": { text: "Ultra Rare", cls: "bg-primary/20 text-primary" },
  grail: { text: "Grail", cls: "gradient-gold text-gold-foreground" },
};

export function ProductCard({ product }: { product: Product }) {
  const [watched, setWatched] = useState(false);
  useEffect(() => {
    setWatched(isWatched(product.id));
    const h = () => setWatched(isWatched(product.id));
    window.addEventListener("pr:watchlist", h);
    return () => window.removeEventListener("pr:watchlist", h);
  }, [product.id]);

  const trend = trendPct(product);
  const positive = trend >= 0;
  const category = getCategory(product.categoryId);
  const rl = rarityLabel[product.rarity];

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]",
      rarityRing[product.rarity],
    )}>
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted/40 to-background">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/90 to-transparent" />
          <span className={cn("absolute left-2.5 top-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", rl.cls)}>
            {rl.text}
          </span>
          {product.platform && (
            <span className="absolute bottom-2.5 left-2.5 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
              {product.platform}
            </span>
          )}
        </div>
      </Link>
      <button
        onClick={() => setWatched(toggleWatchlist(product.id))}
        aria-label="Toggle wishlist"
        className={cn(
          "absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition-all",
          watched
            ? "border-gold bg-gold/15 text-gold"
            : "border-border/60 bg-background/60 text-muted-foreground hover:border-gold hover:text-gold",
        )}
      >
        <Star className={cn("h-4 w-4", watched && "fill-current")} />
      </button>
      <div className="p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{category?.icon} {category?.name}</span>
          <TimeAgo iso={product.updatedAt} />
        </div>
        <Link to="/products/$slug" params={{ slug: product.slug }}>
          <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug transition-colors hover:text-primary">
            {product.title}
          </h3>
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-border/40 bg-background/40 p-2 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Loose</div>
            <div className="num font-semibold">{formatPrice(loosePrice(product))}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Top</div>
            <div className="num font-semibold text-primary">{formatPrice(topPrice(product))}</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">30d trend</span>
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium num",
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
