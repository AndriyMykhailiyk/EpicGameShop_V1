import type { Game } from "@/types/game";
import { logger } from "@/lib/logger";

/** Shape of a single game from the FreeToGame public API */
interface FreeToGameEntry {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

const FREETOGAME_API_URL = "https://www.freetogame.com/api/games";
const FETCH_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000;

/** Base price range in UAH per genre (min–max). */
const GENRE_PRICE_RANGES: Record<string, [number, number]> = {
  Shooter: [899, 1899],
  MMORPG: [699, 1499],
  ARPG: [799, 1699],
  Strategy: [599, 1299],
  MOBA: [499, 1099],
  Racing: [799, 1599],
  Sports: [699, 1399],
  "Card Game": [299, 799],
  Social: [249, 599],
  Fighting: [699, 1299],
  Fantasy: [599, 1399],
};
const DEFAULT_PRICE_RANGE: [number, number] = [399, 999];

/**
 * Deterministic hash from a numeric ID — always returns the same float in [0,1)
 * for the same input, so prices stay stable across page reloads.
 */
function seededRandom(id: number): number {
  const x = Math.sin(id * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/**
 * Generates a consistent price set for a FreeToGame entry based on its
 * genre and numeric ID (deterministic, no randomness).
 */
function generatePrice(entry: FreeToGameEntry): {
  originalPrice: string;
  discountedPrice: string;
  discount: number;
} {
  const [min, max] = GENRE_PRICE_RANGES[entry.genre] ?? DEFAULT_PRICE_RANGE;

  const rand1 = seededRandom(entry.id);
  const rand2 = seededRandom(entry.id + 7919);

  const base = Math.round(min + rand1 * (max - min));
  const originalRaw = Math.ceil(base / 10) * 10 - 0.01;
  const original = +originalRaw.toFixed(2);

  const discountSteps = [10, 15, 20, 25, 30, 35, 40, 50, 60];
  const discountPct = discountSteps[Math.floor(rand2 * discountSteps.length)];

  const discounted = +(original * (1 - discountPct / 100)).toFixed(2);

  return {
    originalPrice: `${original.toFixed(2)} грн`,
    discountedPrice: `${discounted.toFixed(2)} грн`,
    discount: discountPct,
  };
}

/**
 * Parses the "platform" string from FreeToGame into an array.
 *
 * @example
 * parsePlatforms("PC (Windows), Web Browser") // ["Windows", "Web Browser"]
 */
function parsePlatforms(raw: string): string[] {
  return raw
    .split(",")
    .map((p) => p.trim().replace("PC (Windows)", "Windows"))
    .filter(Boolean);
}

/**
 * Maps a FreeToGame API entry to the internal `Game` type.
 * IDs are prefixed with `ftg-` to prevent collisions with DB games.
 * Prices are generated deterministically based on genre and game ID.
 */
function mapFreeToGameEntry(entry: FreeToGameEntry): Game {
  const pricing = generatePrice(entry);

  return {
    id: `ftg-${entry.id}`,
    title: entry.title,
    originalPrice: pricing.originalPrice,
    discountedPrice: pricing.discountedPrice,
    discount: pricing.discount,
    imageUrl: entry.thumbnail,
    tags: [entry.genre],
    developer: entry.developer,
    publisher: entry.publisher,
    platforms: parsePlatforms(entry.platform),
    releaseDate: entry.release_date,
    description: entry.short_description,
    isFree: false,
    isMegaSale: false,
    price: undefined,
    image: undefined,
  };
}

/**
 * Fetches the full free-to-play game list from FreeToGame.
 * Implements retry with exponential backoff and request timeout.
 *
 * @returns Mapped `Game[]` or an empty array on failure
 */
export async function fetchFreeToGameCatalog(): Promise<Game[]> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        FETCH_TIMEOUT_MS,
      );

      const response = await fetch(FREETOGAME_API_URL, {
        signal: controller.signal,
        next: { revalidate: 3600 },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`FreeToGame API responded with ${response.status}`);
      }

      const data: FreeToGameEntry[] = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("FreeToGame API returned non-array payload");
      }

      logger.info("FreeToGame catalog fetched", { count: data.length });
      return data.map(mapFreeToGameEntry);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`FreeToGame fetch attempt ${attempt + 1} failed`, {
        error: message,
      });

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error("FreeToGame catalog unavailable after retries");
  return [];
}
