import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Game } from "@/types/game";
import type { GameRow } from "./gameMapper";
import { mergeStaticCatalogWithDbRows } from "./mergeCatalog";
import { fetchFreeToGameCatalog } from "./freeToGameApi";
import { getSaleGames } from "@/lib/api/game";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedGames: Game[] | null = null;
let cacheTimestamp = 0;
let cachePromise: Promise<Game[]> | null = null;

/** Invalidates the in-memory catalog cache so the next call re-fetches. */
export function invalidateCatalogCache(): void {
  cachedGames = null;
  cacheTimestamp = 0;
  cachePromise = null;
}

/**
 * Loads the storefront catalog combining three sources with an in-memory
 * cache that revalidates every 5 minutes.
 *
 * 1. **Static catalog** (`getSaleGames()`) — built-in games that always appear.
 * 2. **Supabase DB** (`games` where `is_active = true`) — admin-added or
 *    admin-edited games. DB rows override static entries with the same `id`;
 *    extra DB-only rows are appended after the static list.
 * 3. **FreeToGame API** — free-to-play titles appended at the end.
 *
 * Deduplication:
 * - Static <> DB: matched by `id` (DB row wins).
 * - Combined <> FreeToGame: matched by title (case-insensitive); duplicates
 *   from the API are excluded.
 *
 * @returns Combined list of games for store pages and search
 */
export async function loadCatalogGames(): Promise<Game[]> {
  const now = Date.now();

  if (cachedGames && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedGames;
  }

  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = fetchAndMergeCatalog()
    .then((games) => {
      cachedGames = games;
      cacheTimestamp = Date.now();
      cachePromise = null;
      return games;
    })
    .catch((err) => {
      cachePromise = null;
      logger.error("Catalog load failed, returning fallback", {
        error: err instanceof Error ? err.message : String(err),
      });
      return cachedGames ?? getSaleGames();
    });

  return cachePromise;
}

/**
 * Paginated slice of the cached catalog.
 *
 * @param page - 1-based page number
 * @param limit - items per page (capped at 100)
 * @returns `{ games, total, page, limit, totalPages }`
 */
export async function loadPaginatedCatalog(
  page = 1,
  limit = 20,
): Promise<{
  games: Game[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);

  const all = await loadCatalogGames();
  const total = all.length;
  const totalPages = Math.ceil(total / safeLimit);
  const start = (safePage - 1) * safeLimit;
  const games = all.slice(start, start + safeLimit);

  return { games, total, page: safePage, limit: safeLimit, totalPages };
}

/**
 * Finds a single game by its ID from the cached catalog.
 *
 * @param id - Game ID (e.g. `"3"`, `"ftg-540"`)
 * @returns The matched game or `null` if not found
 */
export async function findGameById(id: string): Promise<Game | null> {
  const all = await loadCatalogGames();
  return all.find((g) => g.id === id) ?? null;
}

async function fetchAndMergeCatalog(): Promise<Game[]> {
  const [dbRows, apiGames] = await Promise.all([
    loadDatabaseRows(),
    loadApiGames(),
  ]);

  const staticGames = getSaleGames();
  const coreGames = mergeStaticCatalogWithDbRows(staticGames, dbRows);

  const coreTitles = new Set(
    coreGames.map((g) => g.title.toLowerCase().trim()),
  );

  const uniqueApiGames = apiGames.filter(
    (g) => !coreTitles.has(g.title.toLowerCase().trim()),
  );

  return [...coreGames, ...uniqueApiGames];
}

/**
 * Fetches active game rows from the Supabase `games` table.
 *
 * @returns `GameRow[]` ordered by `created_at` ascending, or empty on failure
 */
async function loadDatabaseRows(): Promise<GameRow[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      logger.warn("Catalog DB read failed", {
        code: error.code,
        message: error.message,
      });
      return [];
    }

    return (data ?? []) as GameRow[];
  } catch (err) {
    logger.error("Unexpected DB catalog load failure", {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

/**
 * Loads free-to-play games from the FreeToGame API with graceful fallback.
 *
 * @returns Mapped `Game[]` or empty on failure
 */
async function loadApiGames(): Promise<Game[]> {
  try {
    return await fetchFreeToGameCatalog();
  } catch (err) {
    logger.error("FreeToGame catalog load failure", {
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}
