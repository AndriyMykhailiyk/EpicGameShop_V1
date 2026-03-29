import { type NextRequest, NextResponse } from "next/server";
import {
  loadCatalogGames,
  loadPaginatedCatalog,
} from "@/lib/catalog/loadGames";
import { logger } from "@/lib/logger";

/**
 * GET /api/games/catalog — public catalog endpoint.
 *
 * **Default behaviour:** returns the full catalog (backward compatible).
 *
 * Optional query parameters for pagination:
 * - `page`   (number) + `limit` (number, max 100) — enables pagination,
 *   returns `{ games, total, page, limit, totalPages }`
 * - `search` (string) — case-insensitive title/developer/description filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const usePagination = pageParam !== null || limitParam !== null;

    if (usePagination) {
      const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(limitParam ?? "20", 10) || 20),
      );

      if (search) {
        const all = await loadCatalogGames();
        const filtered = all.filter(
          (g) =>
            g.title.toLowerCase().includes(search) ||
            g.developer?.toLowerCase().includes(search) ||
            g.description?.toLowerCase().includes(search),
        );
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const games = filtered.slice(start, start + limit);

        return NextResponse.json({ games, total, page, limit, totalPages });
      }

      const result = await loadPaginatedCatalog(page, limit);
      return NextResponse.json(result);
    }

    const games = await loadCatalogGames();
    const filtered = search
      ? games.filter(
          (g) =>
            g.title.toLowerCase().includes(search) ||
            g.developer?.toLowerCase().includes(search) ||
            g.description?.toLowerCase().includes(search),
        )
      : games;

    return NextResponse.json({ games: filtered });
  } catch (err) {
    logger.error("catalog GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 },
    );
  }
}
