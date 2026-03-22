import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";
import { analyticsQuerySchema } from "@/lib/validation/adminSchemas";

type OrderItemRow = {
  game_id: string;
  game_title: string;
  quantity: number | null;
};

type OrderRow = {
  total: number | string | null;
  created_at: string;
  status: string;
  order_items: OrderItemRow[] | null;
};

/** First instant of the month in UTC (for bucketing DB `timestamptz`). */
function startOfUtcMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function monthKeyUtc(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export type AnalyticsSeriesPoint = {
  date?: string;
  period?: string;
  revenue: number;
  units: number;
  orders: number;
};

/**
 * GET /api/admin/analytics — revenue, units, and order counts per bucket.
 */
export async function GET(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const raw = {
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      granularity: searchParams.get("granularity") ?? "day",
    };
    const parsed = analyticsQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { granularity } = parsed.data;
    const to = parsed.data.to ? new Date(parsed.data.to) : new Date();
    const from = parsed.data.from
      ? new Date(parsed.data.from)
      : new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("total, created_at, status, order_items(game_id, game_title, quantity)")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Analytics orders failed", { message: error.message });
      return NextResponse.json(
        { error: "Failed to load analytics" },
        { status: 500 },
      );
    }

    const list = (orders ?? []) as OrderRow[];
    const paid = list.filter((o) => o.status === "paid");

    let revenueInRange = 0;
    const unitsByGame: Record<string, { title: string; units: number }> = {};

    for (const o of paid) {
      revenueInRange += Number(o.total ?? 0);
      const items = o.order_items ?? [];
      for (const it of items) {
        const q = Number(it.quantity ?? 0);
        const gid = it.game_id;
        if (!unitsByGame[gid]) {
          unitsByGame[gid] = { title: it.game_title, units: 0 };
        }
        unitsByGame[gid].units += q;
      }
    }

    const topGames = Object.entries(unitsByGame)
      .map(([gameId, v]) => ({
        gameId,
        title: v.title,
        unitsSold: v.units,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 10);

    let series: AnalyticsSeriesPoint[] = [];

    if (granularity === "month") {
      const buckets: Record<
        string,
        { revenue: number; units: number; orders: number }
      > = {};
      let m = startOfUtcMonth(from);
      const endM = startOfUtcMonth(to);
      while (m <= endM) {
        buckets[monthKeyUtc(m)] = { revenue: 0, units: 0, orders: 0 };
        m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
      }

      for (const o of list) {
        const key = monthKeyUtc(startOfUtcMonth(new Date(o.created_at)));
        if (!(key in buckets)) {
          continue;
        }
        buckets[key].orders += 1;
        if (o.status === "paid") {
          buckets[key].revenue += Number(o.total ?? 0);
          for (const it of o.order_items ?? []) {
            buckets[key].units += Number(it.quantity ?? 0);
          }
        }
      }

      series = Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, v]) => ({
          period,
          revenue: v.revenue,
          units: v.units,
          orders: v.orders,
        }));
    } else {
      const buckets: Record<
        string,
        { revenue: number; units: number; orders: number }
      > = {};
      const fromDayUtc = Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth(),
        from.getUTCDate(),
      );
      const toDayUtc = Date.UTC(
        to.getUTCFullYear(),
        to.getUTCMonth(),
        to.getUTCDate(),
      );
      const dayMs = 24 * 60 * 60 * 1000;
      for (let t = fromDayUtc; t <= toDayUtc; t += dayMs) {
        const key = new Date(t).toISOString().slice(0, 10);
        buckets[key] = {
          revenue: 0,
          units: 0,
          orders: 0,
        };
      }

      for (const o of list) {
        const key = dayKey(o.created_at);
        if (!(key in buckets)) {
          continue;
        }
        buckets[key].orders += 1;
        if (o.status === "paid") {
          buckets[key].revenue += Number(o.total ?? 0);
          for (const it of o.order_items ?? []) {
            buckets[key].units += Number(it.quantity ?? 0);
          }
        }
      }

      series = Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({
          date,
          revenue: v.revenue,
          units: v.units,
          orders: v.orders,
        }));
    }

    const paidCount = paid.length;
    const pendingCount = list.filter((o) => o.status === "pending").length;
    const avgOrder =
      paidCount > 0 ? revenueInRange / paidCount : 0;

    return NextResponse.json({
      granularity,
      from: from.toISOString(),
      to: to.toISOString(),
      revenueInRange,
      series,
      topGames,
      summary: {
        totalOrdersInRange: list.length,
        paidOrders: paidCount,
        pendingOrders: pendingCount,
        averageOrderValue: avgOrder,
      },
    });
  } catch (err) {
    logger.error("Analytics GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
