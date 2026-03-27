import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Game } from "@/types/game";
import type { GameRow } from "./gameMapper";
import { mergeStaticCatalogWithDbRows } from "./mergeCatalog";
import { fetchFreeToGameCatalog } from "./freeToGameApi";
import { getSaleGames } from "@/lib/api/game";

/**
 * Loads the storefront catalog combining three sources:
 *
 * 1. **Static catalog** (`getSaleGames()`) — built-in games that always appear.
 * 2. **Supabase DB** (`games` where `is_active = true`) — admin-added or
 *    admin-edited games. DB rows override static entries with the same `id`;
 *    extra DB-only rows are appended after the static list.
 * 3. **FreeToGame API** — free-to-play titles appended at the end.
 *
 * Deduplication:
 * - Static ↔ DB: matched by `id` (DB row wins).
 * - Combined ↔ FreeToGame: matched by title (case-insensitive); duplicates
 *   from the API are excluded.
 *
 * @returns Combined list of games for store pages and search
 */
export async function loadCatalogGames(): Promise<Game[]> {
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
 * Returns raw rows so the caller can merge them with static data.
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
