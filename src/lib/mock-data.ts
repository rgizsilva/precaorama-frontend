// Deterministic, SSR-safe seed data for PREÇORAMA — collectible price tracking.
// All randomness is seeded by product id so SSR and client render identically.

export type Platform =
  | "NES" | "SNES" | "N64" | "GameCube" | "Wii" | "Switch"
  | "PS1" | "PS2" | "PS3" | "PS4" | "PS5"
  | "Xbox" | "X360" | "Series X"
  | "Mega Drive" | "Saturn" | "Dreamcast"
  | "Game Boy" | "GBA" | "DS" | "3DS"
  | "PC";

export type Franchise =
  | "Pokémon" | "Yu-Gi-Oh!" | "Magic: The Gathering"
  | "Super Mario" | "Zelda" | "Sonic" | "Final Fantasy" | "Metroid"
  | "Dragon Ball" | "One Piece" | "Naruto" | "Star Wars" | "Marvel" | "DC";

export type CollectibleType =
  | "video-game" | "console" | "accessory"
  | "tcg-card" | "card-set"
  | "funko" | "action-figure" | "statue" | "anime-merch";

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: CollectibleType[];
  icon: string;
};

export type Condition = {
  key: string;        // "loose", "cib", "new", "psa9" etc
  label: string;      // "Loose", "Complete in Box", "Sealed", "PSA 9"
  multiplier: number; // vs base
};

export type PricePoint = { date: string; price: number };

export type SoldListing = {
  id: string;
  date: string;
  price: number;
  condition: string;
  source: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  type: CollectibleType;
  franchise?: Franchise;
  platform?: Platform;
  releaseYear?: number;
  region?: "NTSC-U" | "PAL" | "NTSC-J" | "Worldwide";
  rarity: "common" | "uncommon" | "rare" | "ultra-rare" | "grail";
  imageUrl: string;
  gallery: string[];
  basePrice: number;            // anchor (typically "new/sealed" baseline)
  conditions: Condition[];      // available pricing tiers
  history: PricePoint[];        // 180d of the BASE condition (sealed/new)
  recentSold: SoldListing[];
  updatedAt: string;            // fixed ISO; render time-ago client-only
};

// -------- Deterministic PRNG (mulberry32) --------
function hash(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fixed reference timestamp so SSR + hydration produce identical strings.
export const EPOCH_ISO = "2026-05-17T12:00:00.000Z";
const EPOCH = new Date(EPOCH_ISO).getTime();

function makeHistory(id: string, base: number, days = 180, vol = 0.05): PricePoint[] {
  const r = rng(hash(id + ":hist"));
  const out: PricePoint[] = [];
  let price = base * 0.82;
  for (let i = days; i >= 0; i--) {
    const drift = (Math.sin(i / 14) + Math.cos(i / 33)) * vol * base * 0.3;
    const noise = (r() - 0.5) * vol * base;
    price = Math.max(base * 0.4, price + drift * 0.05 + noise * 0.45);
    out.push({
      date: new Date(EPOCH - i * 86400000).toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
    });
  }
  out[out.length - 1].price = Math.round(base * 100) / 100;
  return out;
}

function makeSold(id: string, base: number, conds: Condition[]): SoldListing[] {
  const r = rng(hash(id + ":sold"));
  const sources = ["eBay", "Mercado Livre", "Heritage", "PWCC", "Goldin"];
  const out: SoldListing[] = [];
  for (let i = 0; i < 12; i++) {
    const c = conds[Math.floor(r() * conds.length)];
    const variance = 0.9 + r() * 0.25;
    out.push({
      id: `${id}-s${i}`,
      date: new Date(EPOCH - Math.floor(r() * 60) * 86400000).toISOString().slice(0, 10),
      price: Math.round(base * c.multiplier * variance * 100) / 100,
      condition: c.label,
      source: sources[Math.floor(r() * sources.length)],
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// -------- Categories --------
export const categories: Category[] = [
  { id: "cat-vg", name: "Video Games", slug: "video-games", type: ["video-game"], icon: "🎮" },
  { id: "cat-console", name: "Consoles", slug: "consoles", type: ["console"], icon: "📺" },
  { id: "cat-accessory", name: "Accessories", slug: "accessories", type: ["accessory"], icon: "🕹️" },
  { id: "cat-pokemon", name: "Pokémon TCG", slug: "pokemon-tcg", type: ["tcg-card"], icon: "⚡" },
  { id: "cat-yugioh", name: "Yu-Gi-Oh!", slug: "yu-gi-oh", type: ["tcg-card"], icon: "🃏" },
  { id: "cat-mtg", name: "Magic: The Gathering", slug: "mtg", type: ["tcg-card"], icon: "✨" },
  { id: "cat-funko", name: "Funko Pop!", slug: "funko-pop", type: ["funko"], icon: "🧸" },
  { id: "cat-figures", name: "Action Figures", slug: "action-figures", type: ["action-figure", "statue"], icon: "🦸" },
  { id: "cat-anime", name: "Anime Collectibles", slug: "anime", type: ["anime-merch"], icon: "🐉" },
];

// Condition presets
const C_VG: Condition[] = [
  { key: "loose", label: "Loose", multiplier: 0.45 },
  { key: "cib", label: "Complete in Box", multiplier: 0.75 },
  { key: "new", label: "Sealed", multiplier: 1.0 },
  { key: "graded", label: "Graded WATA 9.4", multiplier: 1.85 },
];
const C_CONSOLE: Condition[] = [
  { key: "loose", label: "Loose", multiplier: 0.55 },
  { key: "cib", label: "Complete in Box", multiplier: 0.85 },
  { key: "new", label: "Sealed", multiplier: 1.0 },
];
const C_CARD: Condition[] = [
  { key: "ungraded", label: "Ungraded NM", multiplier: 0.35 },
  { key: "psa7", label: "PSA 7", multiplier: 0.55 },
  { key: "psa9", label: "PSA 9", multiplier: 0.85 },
  { key: "psa10", label: "PSA 10", multiplier: 1.0 },
];
const C_FUNKO: Condition[] = [
  { key: "loose", label: "Out of Box", multiplier: 0.55 },
  { key: "box", label: "In Box", multiplier: 0.85 },
  { key: "mint", label: "Mint Box", multiplier: 1.0 },
];
const C_FIG: Condition[] = [
  { key: "loose", label: "Loose", multiplier: 0.6 },
  { key: "box", label: "In Box", multiplier: 0.9 },
  { key: "sealed", label: "Sealed", multiplier: 1.0 },
];

type Seed = Omit<Product, "history" | "recentSold" | "updatedAt" | "conditions"> & {
  conditions: Condition[];
  daysAgo: number;
};

const seeds: Seed[] = [
  // ---- Video games (retro) ----
  { id: "p-smb-nes", title: "Super Mario Bros. (NES)", slug: "super-mario-bros-nes",
    description: "Iconic NES launch title. Sealed copies command premium pricing among WATA collectors.",
    categoryId: "cat-vg", type: "video-game", franchise: "Super Mario", platform: "NES",
    releaseYear: 1985, region: "NTSC-U", rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=900",
    gallery: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=900", "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=900"],
    basePrice: 9800, conditions: C_VG, daysAgo: 1 },
  { id: "p-zelda-nes", title: "The Legend of Zelda – Gold Cartridge (NES)", slug: "zelda-gold-nes",
    description: "Original gold cartridge release of The Legend of Zelda, complete in box with map and registration card.",
    categoryId: "cat-vg", type: "video-game", franchise: "Zelda", platform: "NES",
    releaseYear: 1987, region: "NTSC-U", rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=900",
    gallery: ["https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=900"],
    basePrice: 1750, conditions: C_VG, daysAgo: 2 },
  { id: "p-chrono-snes", title: "Chrono Trigger (SNES)", slug: "chrono-trigger-snes",
    description: "Square's legendary JRPG. Highly sought-after CIB with manual and map.",
    categoryId: "cat-vg", type: "video-game", platform: "SNES", releaseYear: 1995, region: "NTSC-U", rarity: "ultra-rare",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=900",
    gallery: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?w=900"],
    basePrice: 1450, conditions: C_VG, daysAgo: 3 },
  { id: "p-oot-n64", title: "Ocarina of Time (N64)", slug: "ocarina-of-time-n64",
    description: "Zelda: Ocarina of Time, N64 cartridge. Gold and grey variants exist.",
    categoryId: "cat-vg", type: "video-game", franchise: "Zelda", platform: "N64",
    releaseYear: 1998, region: "NTSC-U", rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1640955014216-75201056c829?w=900",
    gallery: ["https://images.unsplash.com/photo-1640955014216-75201056c829?w=900"],
    basePrice: 620, conditions: C_VG, daysAgo: 4 },
  { id: "p-sonic-md", title: "Sonic the Hedgehog (Mega Drive)", slug: "sonic-mega-drive",
    description: "Sega Mega Drive launch hero. PAL release, complete in box.",
    categoryId: "cat-vg", type: "video-game", franchise: "Sonic", platform: "Mega Drive",
    releaseYear: 1991, region: "PAL", rarity: "uncommon",
    imageUrl: "https://images.unsplash.com/photo-1614853035488-2c019f5edd7a?w=900",
    gallery: ["https://images.unsplash.com/photo-1614853035488-2c019f5edd7a?w=900"],
    basePrice: 320, conditions: C_VG, daysAgo: 5 },
  { id: "p-mm2-nes", title: "Mega Man 2 (NES)", slug: "mega-man-2-nes",
    description: "Capcom's classic. Sealed graded copies trending upward.",
    categoryId: "cat-vg", type: "video-game", platform: "NES", releaseYear: 1989, region: "NTSC-U", rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900",
    gallery: ["https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900"],
    basePrice: 540, conditions: C_VG, daysAgo: 6 },
  { id: "p-mh-ps2", title: "Metal Gear Solid 3: Subsistence (PS2)", slug: "mgs3-subsistence-ps2",
    description: "Kojima's stealth masterpiece, expanded edition.",
    categoryId: "cat-vg", type: "video-game", platform: "PS2", releaseYear: 2006, region: "NTSC-U", rarity: "uncommon",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=900",
    gallery: ["https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=900"],
    basePrice: 180, conditions: C_VG, daysAgo: 7 },

  // ---- Consoles ----
  { id: "p-snes-console", title: "Super Nintendo (SNES) – Console", slug: "snes-console",
    description: "Original SNES console, complete in box with all original cables and controllers.",
    categoryId: "cat-console", type: "console", platform: "SNES", releaseYear: 1990, region: "NTSC-U", rarity: "uncommon",
    imageUrl: "https://images.unsplash.com/photo-1531390658120-e06b58d826ea?w=900",
    gallery: ["https://images.unsplash.com/photo-1531390658120-e06b58d826ea?w=900"],
    basePrice: 480, conditions: C_CONSOLE, daysAgo: 1 },
  { id: "p-dreamcast", title: "Sega Dreamcast – Console", slug: "sega-dreamcast",
    description: "The cult-favorite Sega Dreamcast. CIB units in demand.",
    categoryId: "cat-console", type: "console", platform: "Dreamcast", releaseYear: 1999, region: "NTSC-U", rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1592890278525-83cfffeaa6c4?w=900",
    gallery: ["https://images.unsplash.com/photo-1592890278525-83cfffeaa6c4?w=900"],
    basePrice: 290, conditions: C_CONSOLE, daysAgo: 2 },
  { id: "p-ps2-fat", title: "PlayStation 2 (Fat) – Console", slug: "ps2-fat-console",
    description: "Original PS2 'fat' model, complete in box.",
    categoryId: "cat-console", type: "console", platform: "PS2", releaseYear: 2000, region: "NTSC-U", rarity: "uncommon",
    imageUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=900",
    gallery: ["https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=900"],
    basePrice: 220, conditions: C_CONSOLE, daysAgo: 3 },

  // ---- Pokémon TCG ----
  { id: "p-charizard-base", title: "Charizard – Base Set 1st Edition Holo", slug: "charizard-base-1st-holo",
    description: "The most iconic Pokémon card. 1st Edition shadowless Base Set holographic Charizard.",
    categoryId: "cat-pokemon", type: "tcg-card", franchise: "Pokémon", releaseYear: 1999, rarity: "grail",
    imageUrl: "https://images.unsplash.com/photo-1614846384571-1e3171b9e2d9?w=900",
    gallery: ["https://images.unsplash.com/photo-1614846384571-1e3171b9e2d9?w=900"],
    basePrice: 22000, conditions: C_CARD, daysAgo: 1 },
  { id: "p-pikachu-illustrator", title: "Pikachu Illustrator Promo", slug: "pikachu-illustrator",
    description: "The legendary Pikachu Illustrator promo. Less than 50 known worldwide.",
    categoryId: "cat-pokemon", type: "tcg-card", franchise: "Pokémon", releaseYear: 1998, rarity: "grail",
    imageUrl: "https://images.unsplash.com/photo-1647892321477-1d2b1f5e3e6e?w=900",
    gallery: ["https://images.unsplash.com/photo-1647892321477-1d2b1f5e3e6e?w=900"],
    basePrice: 280000, conditions: C_CARD, daysAgo: 2 },
  { id: "p-blastoise-base", title: "Blastoise – Base Set Holo", slug: "blastoise-base-holo",
    description: "Base Set holographic Blastoise, unlimited print run.",
    categoryId: "cat-pokemon", type: "tcg-card", franchise: "Pokémon", releaseYear: 1999, rarity: "ultra-rare",
    imageUrl: "https://images.unsplash.com/photo-1628968434441-d9c61d57a8e9?w=900",
    gallery: ["https://images.unsplash.com/photo-1628968434441-d9c61d57a8e9?w=900"],
    basePrice: 1400, conditions: C_CARD, daysAgo: 3 },
  { id: "p-mewtwo-base", title: "Mewtwo – Base Set Holo", slug: "mewtwo-base-holo",
    description: "The psychic legend in his original Base Set holographic glory.",
    categoryId: "cat-pokemon", type: "tcg-card", franchise: "Pokémon", releaseYear: 1999, rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1628968434441-d9c61d57a8e9?w=900",
    gallery: ["https://images.unsplash.com/photo-1628968434441-d9c61d57a8e9?w=900"],
    basePrice: 850, conditions: C_CARD, daysAgo: 4 },

  // ---- Yu-Gi-Oh ----
  { id: "p-bls-yugioh", title: "Black Luster Soldier – Stardust Vision", slug: "black-luster-soldier",
    description: "Ultra-rare Yu-Gi-Oh! tournament prize card from 1999.",
    categoryId: "cat-yugioh", type: "tcg-card", franchise: "Yu-Gi-Oh!", releaseYear: 1999, rarity: "grail",
    imageUrl: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900",
    gallery: ["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900"],
    basePrice: 9000000, conditions: C_CARD, daysAgo: 1 },
  { id: "p-bewd-lob", title: "Blue-Eyes White Dragon – LOB 1st Edition", slug: "blue-eyes-lob-1st",
    description: "Original 1st Edition Blue-Eyes White Dragon from Legend of Blue Eyes.",
    categoryId: "cat-yugioh", type: "tcg-card", franchise: "Yu-Gi-Oh!", releaseYear: 2002, rarity: "ultra-rare",
    imageUrl: "https://images.unsplash.com/photo-1626551884755-9c1e0a4b7df3?w=900",
    gallery: ["https://images.unsplash.com/photo-1626551884755-9c1e0a4b7df3?w=900"],
    basePrice: 6500, conditions: C_CARD, daysAgo: 2 },
  { id: "p-dm-lob", title: "Dark Magician – LOB 1st Edition", slug: "dark-magician-lob-1st",
    description: "1st Edition Dark Magician from Legend of Blue Eyes White Dragon.",
    categoryId: "cat-yugioh", type: "tcg-card", franchise: "Yu-Gi-Oh!", releaseYear: 2002, rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900",
    gallery: ["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=900"],
    basePrice: 1200, conditions: C_CARD, daysAgo: 3 },

  // ---- MTG ----
  { id: "p-black-lotus", title: "Black Lotus – Alpha", slug: "black-lotus-alpha",
    description: "The most iconic MTG card ever printed. Alpha edition.",
    categoryId: "cat-mtg", type: "tcg-card", franchise: "Magic: The Gathering", releaseYear: 1993, rarity: "grail",
    imageUrl: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=900",
    gallery: ["https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=900"],
    basePrice: 540000, conditions: C_CARD, daysAgo: 1 },

  // ---- Funko ----
  { id: "p-funko-freddy", title: "Funko Pop! Freddy Funko Metallic SDCC", slug: "funko-freddy-metallic-sdcc",
    description: "SDCC exclusive Freddy Funko metallic variant, LE 480.",
    categoryId: "cat-funko", type: "funko", releaseYear: 2014, rarity: "ultra-rare",
    imageUrl: "https://images.unsplash.com/photo-1559131397-f94da358f7ca?w=900",
    gallery: ["https://images.unsplash.com/photo-1559131397-f94da358f7ca?w=900"],
    basePrice: 1800, conditions: C_FUNKO, daysAgo: 2 },
  { id: "p-funko-dbz-goku", title: "Funko Pop! Goku Super Saiyan – Glow", slug: "funko-goku-ssj-glow",
    description: "Glow-in-the-dark variant of Goku Super Saiyan, store exclusive.",
    categoryId: "cat-funko", type: "funko", franchise: "Dragon Ball", releaseYear: 2017, rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=900",
    gallery: ["https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=900"],
    basePrice: 240, conditions: C_FUNKO, daysAgo: 3 },
  { id: "p-funko-mando", title: "Funko Pop! The Mandalorian – Grogu", slug: "funko-mando-grogu",
    description: "Mandalorian holding Grogu, regular release.",
    categoryId: "cat-funko", type: "funko", franchise: "Star Wars", releaseYear: 2020, rarity: "common",
    imageUrl: "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=900",
    gallery: ["https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=900"],
    basePrice: 28, conditions: C_FUNKO, daysAgo: 4 },

  // ---- Action figures ----
  { id: "p-shf-goku", title: "S.H. Figuarts Goku Super Saiyan", slug: "shfiguarts-goku-ssj",
    description: "Bandai S.H. Figuarts Super Saiyan Goku, articulated figure.",
    categoryId: "cat-figures", type: "action-figure", franchise: "Dragon Ball", releaseYear: 2019, rarity: "uncommon",
    imageUrl: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=900",
    gallery: ["https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=900"],
    basePrice: 180, conditions: C_FIG, daysAgo: 1 },
  { id: "p-hottoys-mando", title: "Hot Toys – The Mandalorian 1/6", slug: "hottoys-mandalorian",
    description: "Hot Toys 1/6 scale The Mandalorian collectible figure.",
    categoryId: "cat-figures", type: "action-figure", franchise: "Star Wars", releaseYear: 2021, rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=900",
    gallery: ["https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=900"],
    basePrice: 420, conditions: C_FIG, daysAgo: 2 },

  // ---- Anime ----
  { id: "p-onepiece-statue", title: "One Piece Luffy Gear 5 Statue", slug: "luffy-gear5-statue",
    description: "Premium Luffy Gear 5 statue, resin, limited edition.",
    categoryId: "cat-anime", type: "statue", franchise: "One Piece", releaseYear: 2024, rarity: "rare",
    imageUrl: "https://images.unsplash.com/photo-1606140775080-1d8b89e0fa00?w=900",
    gallery: ["https://images.unsplash.com/photo-1606140775080-1d8b89e0fa00?w=900"],
    basePrice: 680, conditions: C_FIG, daysAgo: 3 },

  // ---- Accessories ----
  { id: "p-snes-multitap", title: "Super Multitap (SNES)", slug: "snes-multitap",
    description: "Official Hudson Super Multitap for SNES.",
    categoryId: "cat-accessory", type: "accessory", platform: "SNES", releaseYear: 1992, rarity: "uncommon",
    imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=900",
    gallery: ["https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=900"],
    basePrice: 65, conditions: C_CONSOLE, daysAgo: 6 },
];

export const products: Product[] = seeds.map((s) => {
  const r = rng(hash(s.id + ":meta"));
  const vol = 0.05 + r() * 0.08;
  const history = makeHistory(s.id, s.basePrice, 180, vol);
  return {
    ...s,
    history,
    recentSold: makeSold(s.id, s.basePrice, s.conditions),
    updatedAt: new Date(EPOCH - s.daysAgo * 3600000).toISOString(),
  };
});

// -------- Helpers --------

export function priceFor(p: Product, conditionKey?: string): number {
  const c = conditionKey
    ? p.conditions.find((x) => x.key === conditionKey) ?? p.conditions[p.conditions.length - 1]
    : p.conditions[p.conditions.length - 1];
  return Math.round(p.basePrice * c.multiplier * 100) / 100;
}

export function loosePrice(p: Product) { return priceFor(p, p.conditions[0]?.key); }
export function topPrice(p: Product) { return priceFor(p, p.conditions[p.conditions.length - 1]?.key); }
export function avgPrice(p: Product) {
  const prices = p.history.map((h) => h.price);
  return Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;
}
export function lowPrice(p: Product) { return Math.min(...p.history.map((h) => h.price)); }
export function highPrice(p: Product) { return Math.max(...p.history.map((h) => h.price)); }
export function volatility(p: Product) {
  const a = avgPrice(p);
  return Math.min(100, Math.round(((highPrice(p) - lowPrice(p)) / a) * 100));
}

export function trendPct(p: Product, days = 30): number {
  const h = p.history;
  if (h.length < days + 1) return 0;
  const past = h[h.length - 1 - days].price;
  const now = h[h.length - 1].price;
  return Math.round(((now - past) / past) * 1000) / 10;
}

export function getProduct(slug: string) { return products.find((p) => p.slug === slug); }
export function getCategory(id: string) { return categories.find((c) => c.id === id); }
export function getCategoryBySlug(slug: string) { return categories.find((c) => c.slug === slug); }

export function relatedProducts(p: Product, n = 4) {
  return products
    .filter((x) => x.id !== p.id && (x.categoryId === p.categoryId || x.franchise === p.franchise))
    .slice(0, n);
}

export function formatBRL(n: number): string {
  if (n >= 1000) return "R$ " + n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  return "R$ " + n.toFixed(2).replace(".", ",");
}
export const formatPrice = formatBRL;

// -------- Watchlist + Collection (localStorage) --------

const WL_KEY = "pr_watchlist_v1";
const COL_KEY = "pr_collection_v1"; // { [productId]: { conditionKey } }

export type CollectionEntry = { conditionKey: string };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export function getWatchlist(): string[] { return read<string[]>(WL_KEY, []); }
export function isWatched(id: string) { return getWatchlist().includes(id); }
export function toggleWatchlist(id: string): boolean {
  const cur = getWatchlist();
  const exists = cur.includes(id);
  const next = exists ? cur.filter((x) => x !== id) : [...cur, id];
  localStorage.setItem(WL_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("pr:watchlist"));
  return !exists;
}

export function getCollection(): Record<string, CollectionEntry> { return read<Record<string, CollectionEntry>>(COL_KEY, {}); }
export function isOwned(id: string) { return !!getCollection()[id]; }
export function setOwned(id: string, conditionKey: string) {
  const c = getCollection();
  c[id] = { conditionKey };
  localStorage.setItem(COL_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("pr:collection"));
}
export function removeOwned(id: string) {
  const c = getCollection();
  delete c[id];
  localStorage.setItem(COL_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("pr:collection"));
}
