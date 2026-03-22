import { getSaleGames } from "@/lib/api/game";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Game } from "@/types/game";
import type { GameRow } from "./gameMapper";
import { mergeStaticCatalogWithDbRows } from "./mergeCatalog";

/**
 * Loads the storefront catalog: built-in static games plus Supabase `games`.
 *
 * - If the DB is empty or unreadable, returns only {@link getSaleGames}.
 * - Otherwise: static order is preserved; DB rows with the same `id` override static entries;
 *   rows with new ids are appended at the end (by `created_at`, then title).
 *
 * @returns List of games for store pages and APIs
 */
export async function loadCatalogGames(): Promise<Game[]> {
  const staticGames = getSaleGames();

  try {
    const { data, error } = await supabaseAdmin
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      logger.warn("Catalog DB read failed; using static games", {
        code: error.code,
        message: error.message,
      });
      return staticGames;
    }

    const rows = (data ?? []) as GameRow[];
    if (rows.length === 0) {
      return staticGames;
    }

    return mergeStaticCatalogWithDbRows(staticGames, rows);
  } catch (err) {
    logger.error("Unexpected catalog load failure", {
      error: err instanceof Error ? err.message : String(err),
    });
    return staticGames;
  }
}
