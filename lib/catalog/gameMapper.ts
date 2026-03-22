import type { Game } from "@/types/game";

/** Row shape returned from Supabase `games` table */
export type GameRow = {
  id: string;
  title: string;
  original_price: string;
  discounted_price: string;
  discount: number | null;
  image_url: string;
  tags: string[] | null;
  developer: string | null;
  publisher: string | null;
  platforms: string[] | null;
  description: string | null;
  is_mega_sale: boolean | null;
  sale_ends_at: string | null;
  original_price_uah: number | string | null;
  discounted_price_uah: number | string | null;
  is_active: boolean | null;
  created_at?: string | null;
};

/**
 * Maps a database row to the storefront `Game` type.
 *
 * @param row - Supabase games row
 * @returns Game object used by UI and cart
 */
export function mapGameRowToGame(row: GameRow): Game {
  return {
    id: row.id,
    title: row.title,
    originalPrice: row.original_price,
    discountedPrice: row.discounted_price,
    discount: row.discount ?? undefined,
    imageUrl: row.image_url,
    tags: row.tags ?? [],
    developer: row.developer ?? undefined,
    publisher: row.publisher ?? undefined,
    platforms: row.platforms ?? [],
    description: row.description ?? undefined,
    isMegaSale: Boolean(row.is_mega_sale),
    saleEndsAt: row.sale_ends_at ?? undefined,
    price: undefined,
    image: undefined,
  };
}

/**
 * Builds a payload for inserting/updating a game in Supabase.
 *
 * @param input - Partial game fields from admin forms
 * @param numericOriginal - Parsed original price in UAH
 * @param numericDiscounted - Parsed discounted price in UAH
 */
export function buildGameUpsertPayload(
  input: {
    id: string;
    title: string;
    originalPrice: string;
    discountedPrice: string;
    discount?: number;
    imageUrl: string;
    tags: string[];
    developer?: string;
    publisher?: string;
    platforms: string[];
    description?: string;
    isMegaSale?: boolean;
    saleEndsAt?: string | null;
  },
  numericOriginal: number,
  numericDiscounted: number,
) {
  return {
    id: input.id,
    title: input.title,
    original_price: input.originalPrice,
    discounted_price: input.discountedPrice,
    discount: input.discount ?? 0,
    image_url: input.imageUrl,
    tags: input.tags,
    developer: input.developer ?? null,
    publisher: input.publisher ?? null,
    platforms: input.platforms,
    description: input.description ?? null,
    is_mega_sale: Boolean(input.isMegaSale),
    sale_ends_at: input.saleEndsAt ?? null,
    original_price_uah: numericOriginal,
    discounted_price_uah: numericDiscounted,
    updated_at: new Date().toISOString(),
  };
}

export function gameToApiShape(g: Game): GameRow {
  return {
    id: g.id,
    title: g.title,
    original_price: g.originalPrice,
    discounted_price: g.discountedPrice,
    discount: g.discount ?? 0,
    image_url: g.imageUrl,
    tags: g.tags,
    developer: g.developer ?? null,
    publisher: g.publisher ?? null,
    platforms: g.platforms,
    description: g.description ?? null,
    is_mega_sale: g.isMegaSale ?? false,
    sale_ends_at: g.saleEndsAt ?? null,
    original_price_uah: 0,
    discounted_price_uah: 0,
    is_active: true,
  };
}
