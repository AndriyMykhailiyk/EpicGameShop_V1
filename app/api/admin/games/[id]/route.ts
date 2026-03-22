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

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/games/[id] — update fields for a game.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsed = gameUpsertBodySchema.safeParse({ ...json, id });
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
      .update({ ...payload, is_active: true })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      logger.error("Admin game patch failed", { message: error?.message });
      return NextResponse.json(
        { error: "Could not update game" },
        { status: 500 },
      );
    }

    const row = data as GameRow;
    return NextResponse.json({ game: mapGameRowToGame(row), row });
  } catch (err) {
    logger.error("Admin game PATCH failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/games/[id] — soft-delete (deactivate) a game.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { id } = await context.params;
    const { error } = await supabaseAdmin
      .from("games")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      logger.error("Admin game delete failed", { message: error.message });
      return NextResponse.json(
        { error: "Could not delete game" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("Admin game DELETE failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
