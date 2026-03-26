import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Game } from "@/types/game";
import type { GameRow } from "./gameMapper";
import { mapGameRowToGame } from "./gameMapper";
import { fetchFreeToGameCatalog } from "./freeToGameApi";

/**
 * Loads the storefront catalog: Supabase `games` first, then free-to-play
 * titles from the FreeToGame public API appended at the end.
 *
 * - DB games (where `is_active = true`) are placed at the top of the list.
 * - FreeToGame entries are appended after all DB games.
 * - Duplicates (by title, case-insensitive) from the API are excluded when
 *   they already exist in the DB list.
 * - If the DB is empty, only API games are shown (and vice-versa).
 *
 * @returns Combined list of games for store pages and APIs
 */
export async function loadCatalogGames(): Promise<Game[]> {
  const [dbGames, apiGames] = await Promise.all([
    loadDatabaseGames(),
    loadApiGames(),
  ]);

  const dbTitles = new Set(
    dbGames.map((g) => g.title.toLowerCase().trim()),
  );

  const uniqueApiGames = apiGames.filter(
    (g) => !dbTitles.has(g.title.toLowerCase().trim()),
  );

  return [...dbGames, ...uniqueApiGames];
}

/**
 * Fetches active games from the Supabase `games` table.
 *
 * @returns Mapped `Game[]` ordered by `created_at` ascending, or empty on failure
 */
async function loadDatabaseGames(): Promise<Game[]> {
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

    const rows = (data ?? []) as GameRow[];
    return rows.map(mapGameRowToGame);
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
