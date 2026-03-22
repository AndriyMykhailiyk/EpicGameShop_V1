import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import type { AdminDashboardPayload } from "@/lib/admin/dashboardTypes";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase/server";

type OrderItemRow = {
  game_id: string;
  game_title: string;
  quantity: number | null;
};

type OrderRow = {
  id: string;
  total: number | string | null;
  tax: number | string | null;
  subtotal: number | string | null;
  created_at: string;
  status: string;
  order_items: OrderItemRow[] | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayKeyFromIso(createdAt: string): string {
  return createdAt.slice(0, 10);
}

/**
 * GET /api/admin/dashboard — summary KPIs and chart data for the admin home page.
 */
export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return gate.response;
  }

  try {
    const { count: userCount, error: userErr } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    if (userErr) {
      logger.warn("Dashboard user count failed", { message: userErr.message });
    }

    const { data: orders, error: ordersErr } = await supabaseAdmin
      .from("orders")
      .select(
        "id, total, tax, subtotal, created_at, status, order_items(game_id, game_title, quantity)",
      )
      .order("created_at", { ascending: false });

    if (ordersErr) {
      logger.error("Dashboard orders load failed", {
        message: ordersErr.message,
      });
      return NextResponse.json(
        { error: "Failed to load orders" },
        { status: 500 },
      );
    }

    const list = (orders ?? []) as OrderRow[];
    const paid = list.filter((o) => o.status === "paid");
    const pending = list.filter((o) => o.status === "pending");

    let totalRevenue = 0;
    let totalTax = 0;
    let totalSubtotal = 0;
    let soldUnits = 0;
    const unitsByGame: Record<string, { title: string; units: number }> = {};

    for (const o of paid) {
      totalRevenue += Number(o.total ?? 0);
      totalTax += Number(o.tax ?? 0);
      totalSubtotal += Number(o.subtotal ?? 0);
      const items = o.order_items ?? [];
      for (const it of items) {
        const q = Number(it.quantity ?? 0);
        soldUnits += q;
        const key = it.game_id;
        if (!unitsByGame[key]) {
          unitsByGame[key] = { title: it.game_title, units: 0 };
        }
        unitsByGame[key].units += q;
      }
    }

    const paidOrdersCount = paid.length;
    const averageOrderValue =
      paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    const popularGames = Object.entries(unitsByGame)
      .map(([gameId, v]) => ({
        gameId,
        title: v.title,
        unitsSold: v.units,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 8);

    const now = new Date();
    const endDayUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const startDayUtc = endDayUtc - 29 * DAY_MS;

    const salesByDay: Record<string, number> = {};
    const unitsByDay: Record<string, number> = {};
    const ordersCountByDay: Record<string, number> = {};

    for (let t = startDayUtc; t <= endDayUtc; t += DAY_MS) {
      const k = new Date(t).toISOString().slice(0, 10);
      salesByDay[k] = 0;
      unitsByDay[k] = 0;
      ordersCountByDay[k] = 0;
    }

    for (const o of paid) {
      const key = utcDayKeyFromIso(o.created_at);
      if (!(key in salesByDay)) {
        continue;
      }
      salesByDay[key] += Number(o.total ?? 0);
      for (const it of o.order_items ?? []) {
        unitsByDay[key] += Number(it.quantity ?? 0);
      }
    }

    for (const o of list) {
      const key = utcDayKeyFromIso(o.created_at);
      if (key in ordersCountByDay) {
        ordersCountByDay[key] += 1;
      }
    }

    const salesChart = Object.entries(salesByDay).map(([date, revenue]) => ({
      date,
      revenue,
      units: unitsByDay[date] ?? 0,
      orders: ordersCountByDay[date] ?? 0,
    }));

    const ordersStatusPie =
      paid.length === 0 && pending.length === 0
        ? []
        : [
            { name: "Оплачено", value: paid.length },
            { name: "Очікує", value: pending.length },
          ].filter((x) => x.value > 0);

    const end7 = new Date(now);
    end7.setHours(23, 59, 59, 999);
    const start7 = new Date(end7);
    start7.setDate(start7.getDate() - 6);
    start7.setHours(0, 0, 0, 0);
    const start14 = new Date(start7);
    start14.setDate(start14.getDate() - 7);

    let revenueLast7Days = 0;
    let revenuePrevious7Days = 0;
    for (const o of paid) {
      const dt = new Date(o.created_at);
      const t = Number(o.total ?? 0);
      if (dt >= start7 && dt <= end7) {
        revenueLast7Days += t;
      } else if (dt >= start14 && dt < start7) {
        revenuePrevious7Days += t;
      }
    }

    const payload: AdminDashboardPayload = {
      totalUsers: userCount ?? 0,
      soldGameUnits: soldUnits,
      totalRevenue,
      totalTax,
      totalSubtotal,
      totalOrders: list.length,
      paidOrdersCount,
      pendingOrdersCount: pending.length,
      averageOrderValue,
      popularGames,
      salesChart,
      ordersStatusPie,
      revenueLast7Days,
      revenuePrevious7Days,
    };

    return NextResponse.json(payload);
  } catch (err) {
    logger.error("Dashboard GET failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
