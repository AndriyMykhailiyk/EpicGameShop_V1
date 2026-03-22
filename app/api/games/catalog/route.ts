import { NextResponse } from "next/server";
import { loadCatalogGames } from "@/lib/catalog/loadGames";
import { logger } from "@/lib/logger";

/**
 * GET /api/games/catalog — public catalog for client-side loaders.
 */
export async function GET() {
  try {
    const games = await loadCatalogGames();
    return NextResponse.json({ games });
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
