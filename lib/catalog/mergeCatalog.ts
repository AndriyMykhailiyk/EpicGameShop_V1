import type { Game } from "@/types/game";
import { mapGameRowToGame, type GameRow } from "./gameMapper";

/**
 * Merges the built-in static catalog with Supabase rows.
 *
 * - Order: every static game first (same order as `getSaleGames()`).
 * - If the DB has an active row with the same `id` as a static game, the DB row wins (admin edits).
 * - Rows whose `id` is not in the static list are appended at the end, oldest `created_at` first
 *   so newly added games appear last among extras.
 *
 * @param staticGames - Default storefront list from `getSaleGames()`
 * @param dbRows - Active rows from `games` (caller should filter `is_active`)
 * @returns Combined list for the store and `/api/games/catalog`
 *
 * @example
 * mergeStaticCatalogWithDbRows(getSaleGames(), [{ id: "custom-1", ... }]);
 */
export function mergeStaticCatalogWithDbRows(
  staticGames: Game[],
  dbRows: GameRow[],
): Game[] {
  try {
    const staticIds = new Set(staticGames.map((g) => g.id));
    const dbById = new Map(dbRows.map((r) => [r.id, r]));

    const mergedCore: Game[] = staticGames.map((g) => {
      const row = dbById.get(g.id);
      return row ? mapGameRowToGame(row) : g;
    });

    const extraRows = dbRows.filter((r) => !staticIds.has(r.id));
    extraRows.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (ta !== tb) {
        return ta - tb;
      }
      return a.title.localeCompare(b.title);
    });

    const extras = extraRows.map((r) => mapGameRowToGame(r));
    return [...mergedCore, ...extras];
  } catch {
    return staticGames;
  }
}
