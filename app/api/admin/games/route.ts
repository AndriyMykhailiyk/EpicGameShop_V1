import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import {
  buildGameUpsertPayload,
  mapGameRowToGame,
  type GameRow,
} from "@/lib/catalog/gameMapper";
import { logger } from "@/lib/logger";
import { parseUahString } from "@/lib/pricing/parseUahString";
import { supabaseAdmin } from "@/lib/supabase/server";
import { gameUpsertBodySchema } from "@/lib/validation/adminSchemas";

/**
 * GET /api/admin/games — all games including inactive (admin).
 */
export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("games")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      logger.error("Admin games list failed", { message: error.message });
      return NextResponse.json(
        { error: "Failed to load games" },
        { status: 500 },
      );
    }

    const rows = (data ?? []) as GameRow[];
    return NextResponse.json({
      games: rows.map((r) => ({ row: r, game: mapGameRowToGame(r) })),
    });
  } catch (err) {
    logger.error("Admin games GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/games — create or replace a game row by id.
 */
export async function POST(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const json = await request.json();
    const parsed = gameUpsertBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const b = parsed.data;
    const tags = b.tags ?? [];
    const platforms = b.platforms ?? [];
    const numericOriginal = parseUahString(b.originalPrice);
    const numericDiscounted = parseUahString(b.discountedPrice);

    const payload = buildGameUpsertPayload(
      {
        id: b.id,
        title: b.title,
        originalPrice: b.originalPrice,
        discountedPrice: b.discountedPrice,
        discount: b.discount,
        imageUrl: b.imageUrl,
        tags,
        developer: b.developer,
        publisher: b.publisher,
        platforms,
        description: b.description,
        isMegaSale: b.isMegaSale,
        saleEndsAt: b.saleEndsAt ?? null,
      },
      numericOriginal,
      numericDiscounted,
    );

    const { data, error } = await supabaseAdmin
      .from("games")
      .upsert(
        {
          ...payload,
          is_active: true,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error || !data) {
      logger.error("Admin game upsert failed", { message: error?.message });
      return NextResponse.json(
        { error: "Could not save game" },
        { status: 500 },
      );
    }

    const row = data as GameRow;
    return NextResponse.json({ game: mapGameRowToGame(row), row });
  } catch (err) {
    logger.error("Admin games POST failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
