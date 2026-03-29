import { type NextRequest, NextResponse } from "next/server";
import { loadCatalogGames } from "@/lib/catalog/loadGames";
import { logger } from "@/lib/logger";

const MAX_RESULTS = 8;

/**
 * GET /api/games/search?q=<query> — lightweight search for autocomplete.
 *
 * Returns at most {@link MAX_RESULTS} matching games with minimal fields
 * to keep the response payload small.
 */
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams
      .get("q")
      ?.trim()
      .toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const catalog = await loadCatalogGames();

    const results = [];
    for (const game of catalog) {
      if (results.length >= MAX_RESULTS) break;

      const titleMatch = game.title.toLowerCase().includes(query);
      const devMatch = game.developer?.toLowerCase().includes(query);
      const descMatch = game.description?.toLowerCase().includes(query);

      if (titleMatch || devMatch || descMatch) {
        results.push({
          id: game.id,
          title: game.title,
          imageUrl: game.imageUrl,
          discountedPrice: game.discountedPrice,
          originalPrice: game.originalPrice,
          discount: game.discount,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    logger.error("search GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ results: [] });
  }
}
