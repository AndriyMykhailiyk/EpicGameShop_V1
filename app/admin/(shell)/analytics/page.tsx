"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "../../admin.module.css";

type SeriesPoint = {
  date?: string;
  period?: string;
  revenue: number;
  units: number;
  orders: number;
};

type AnalyticsResponse = {
  granularity: "day" | "month";
  from: string;
  to: string;
  revenueInRange: number;
  series: SeriesPoint[];
  topGames: { gameId: string; title: string; unitsSold: number }[];
  summary: {
    totalOrdersInRange: number;
    paidOrders: number;
    pendingOrders: number;
    averageOrderValue: number;
  };
};

const PIE_COLORS = ["#34d399", "#fbbf24"];
const TOOLTIP_STYLE = {
  background: "#121a24",
  border: "1px solid #2a3a4d",
};

export default function AdminAnalyticsPage() {
  const [granularity, setGranularity] = useState<"day" | "month">("day");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ granularity });
        const res = await fetch(`/api/admin/analytics?${params.toString()}`);
        if (!res.ok) {
          throw new Error("fail");
        }
        const j = (await res.json()) as AnalyticsResponse;
        if (!cancelled) {
          setData(j);
        }
      } catch {
        if (!cancelled) {
          setErr("Не вдалося завантажити аналітику.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [granularity]);

  if (err) {
    return <p style={{ color: "#f87171" }}>{err}</p>;
  }

  if (!data) {
    return <p className={styles.muted}>Завантаження…</p>;
  }

  const chartData = data.series.map((s) => ({
    label: (s.date ?? s.period) as string,
    revenue: s.revenue,
    units: s.units,
    orders: s.orders,
  }));

  const topBar = data.topGames.slice(0, 8).map((g) => ({
    name: g.title.length > 24 ? `${g.title.slice(0, 22)}…` : g.title,
    units: g.unitsSold,
  }));

  const statusPie = [
    { name: "Оплачено", value: data.summary.paidOrders },
    { name: "Очікує", value: data.summary.pendingOrders },
  ].filter((x) => x.value > 0);

  const labelKey = granularity === "day" ? "день" : "місяць";

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Аналітика</h1>
      <p className={styles.muted}>
        Дохід, обсяг продажів у штуках, кількість замовлень і топ ігор за
        обраний період.
      </p>

      <div className={styles.rowActions} style={{ marginTop: "1rem" }}>
        <button
          type="button"
          className={`${styles.btn} ${granularity === "day" ? "" : styles.btnGhost}`}
          onClick={() => setGranularity("day")}
        >
          По днях
        </button>
        <button
          type="button"
          className={`${styles.btn} ${granularity === "month" ? "" : styles.btnGhost}`}
          onClick={() => setGranularity("month")}
        >
          По місяцях
        </button>
      </div>

      <div className={styles.cardGrid} style={{ marginTop: "1rem" }}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Дохід (оплачено)</div>
          <div className={styles.statValue}>
            {data.revenueInRange.toFixed(2)} ₴
          </div>
          <div className={styles.muted}>
            {new Date(data.from).toLocaleDateString()} —{" "}
            {new Date(data.to).toLocaleDateString()}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Замовлень за період</div>
          <div className={styles.statValue}>
            {data.summary.totalOrdersInRange}
          </div>
          <div className={styles.muted}>
            оплачено {data.summary.paidOrders} · очікує{" "}
            {data.summary.pendingOrders}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Середній чек (оплач.)</div>
          <div className={styles.statValue}>
            {data.summary.averageOrderValue.toFixed(2)} ₴
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>
        Дохід та продані копії по {labelKey}
      </h2>
      <div className={`${styles.chartBox} ${styles.chartBoxTall}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
            <XAxis
              dataKey="label"
              stroke="#8fa3b8"
              fontSize={10}
              angle={granularity === "day" ? -35 : 0}
              textAnchor="end"
              height={granularity === "day" ? 50 : 30}
            />
            <YAxis
              yAxisId="left"
              stroke="#34d399"
              fontSize={11}
              width={44}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#7cb8ff"
              fontSize={11}
              width={44}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="units"
              fill="#34d399"
              name="Копій ігор"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#7cb8ff"
              strokeWidth={2}
              name="Дохід ₴"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartGrid2}>
        <div>
          <h2 className={styles.sectionTitle}>Дохід (площа)</h2>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="anRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
                <XAxis dataKey="label" stroke="#8fa3b8" fontSize={10} />
                <YAxis stroke="#8fa3b8" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#34d399"
                  fill="url(#anRev)"
                  name="Дохід ₴"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Замовлення по {labelKey}</h2>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
                <XAxis dataKey="label" stroke="#8fa3b8" fontSize={10} />
                <YAxis
                  stroke="#8fa3b8"
                  fontSize={11}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar
                  dataKey="orders"
                  fill="#a78bfa"
                  name="Замовлення"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.chartGrid2}>
        <div>
          <h2 className={styles.sectionTitle}>Структура замовлень (період)</h2>
          <div className={styles.chartBox}>
            {statusPie.length === 0 ? (
              <p className={styles.muted} style={{ padding: "2rem" }}>
                Немає замовлень у цьому діапазоні.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={({ name, percent }) =>
                      `${name ?? ""} ${(((percent ?? 0) * 100).toFixed(0))}%`
                    }
                  >
                    {statusPie.map((_, i) => (
                      <Cell
                        key={String(i)}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Топ ігор (шт.)</h2>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBar} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
                <XAxis type="number" stroke="#8fa3b8" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  stroke="#8fa3b8"
                  fontSize={9}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar
                  dataKey="units"
                  fill="#f472b6"
                  name="Копій"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Таблиця топ ігор</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Гра</th>
              <th>Продано шт.</th>
            </tr>
          </thead>
          <tbody>
            {data.topGames.length === 0 ? (
              <tr>
                <td colSpan={2} className={styles.muted}>
                  Немає даних за період.
                </td>
              </tr>
            ) : (
              data.topGames.map((g) => (
                <tr key={g.gameId}>
                  <td>{g.title}</td>
                  <td>{g.unitsSold}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
