import { type NextRequest, NextResponse } from "next/server";
import { findGameById } from "@/lib/catalog/loadGames";
import { logger } from "@/lib/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/games/:id — returns a single game by its ID.
 *
 * Looks up the game inside the in-memory catalog cache, so the first
 * call may be slower while the catalog loads; subsequent calls resolve
 * from the cache instantly.
 *
 * @returns `{ game: Game }` on success or `404` when not found
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 },
      );
    }

    const game = await findGameById(id);

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ game });
  } catch (err) {
    logger.error("GET /api/games/[id] failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to load game" },
      { status: 500 },
    );
  }
}
