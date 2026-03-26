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
 */
function mapFreeToGameEntry(entry: FreeToGameEntry): Game {
  return {
    id: `ftg-${entry.id}`,
    title: entry.title,
    originalPrice: "Безкоштовна",
    discountedPrice: "Безкоштовна",
    discount: 0,
    imageUrl: entry.thumbnail,
    tags: [entry.genre],
    developer: entry.developer,
    publisher: entry.publisher,
    platforms: parsePlatforms(entry.platform),
    releaseDate: entry.release_date,
    description: entry.short_description,
    isFree: true,
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
