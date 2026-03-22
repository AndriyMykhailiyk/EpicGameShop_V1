import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/users/[id]/orders — purchase history for a user.
 */
export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { id } = await context.params;

    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("id", id)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = user.email as string;

    const { data: byUser, error: errUser } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    const { data: byEmail, error: errEmail } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (errUser || errEmail) {
      logger.error("User orders load failed", {
        errUser: errUser?.message,
        errEmail: errEmail?.message,
      });
      return NextResponse.json(
        { error: "Failed to load orders" },
        { status: 500 },
      );
    }

    type DbOrder = {
      id: string;
      created_at: string;
      [key: string]: unknown;
    };

    const map = new Map<string, DbOrder>();
    for (const o of (byUser ?? []) as DbOrder[]) {
      map.set(o.id, o);
    }
    for (const o of (byEmail ?? []) as DbOrder[]) {
      map.set(o.id, o);
    }
    const merged = Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return NextResponse.json({ orders: merged });
  } catch (err) {
    logger.error("Admin user orders GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
