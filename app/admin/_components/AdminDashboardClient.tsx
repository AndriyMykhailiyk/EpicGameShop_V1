"use client";

import type { AdminDashboardPayload } from "@/lib/admin/dashboardTypes";
import styles from "../admin.module.css";
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
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#34d399", "#fbbf24", "#7cb8ff", "#f472b6"];
const TOOLTIP_STYLE = {
  background: "#121a24",
  border: "1px solid #2a3a4d",
};

type Props = { data: AdminDashboardPayload };

function formatShortDate(iso: string) {
  return iso.slice(5);
}

export default function AdminDashboardClient({ data }: Props) {
  const topForBar = data.popularGames.slice(0, 6).map((g) => ({
    name:
      g.title.length > 28 ? `${g.title.slice(0, 26)}…` : g.title,
    units: g.unitsSold,
  }));

  const deltaPct =
    data.revenuePrevious7Days > 0
      ? ((data.revenueLast7Days - data.revenuePrevious7Days) /
          data.revenuePrevious7Days) *
        100
      : data.revenueLast7Days > 0
        ? 100
        : 0;

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Dashboard</h1>
      <p className={styles.muted}>
        KPI, динаміка доходу, замовлення та популярність ігор за останні 30
        днів.
      </p>

      <div className={styles.cardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Користувачі</div>
          <div className={styles.statValue}>{data.totalUsers}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Замовлень (усі)</div>
          <div className={styles.statValue}>{data.totalOrders}</div>
          <div className={styles.muted}>
            оплачено {data.paidOrdersCount} · очікує{" "}
            {data.pendingOrdersCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Продано копій ігор</div>
          <div className={styles.statValue}>{data.soldGameUnits}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Дохід (оплачено)</div>
          <div className={styles.statValue}>
            {data.totalRevenue.toFixed(2)} ₴
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Середній чек</div>
          <div className={styles.statValue}>
            {data.averageOrderValue.toFixed(2)} ₴
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>ПДВ + підсумок (оплач.)</div>
          <div className={styles.statValue} style={{ fontSize: "1.1rem" }}>
            ПДВ: {data.totalTax.toFixed(2)} ₴
          </div>
          <div className={styles.muted}>
            без ПДВ: {data.totalSubtotal.toFixed(2)} ₴
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Дохід за 7 днів</div>
          <div className={styles.statValue}>
            {data.revenueLast7Days.toFixed(2)} ₴
          </div>
          <div
            className={
              deltaPct >= 0 ? styles.deltaPositive : styles.deltaNegative
            }
          >
            vs попередні 7 дн.:{" "}
            {deltaPct >= 0 ? "+" : ""}
            {deltaPct.toFixed(1)}%
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Графіки</h2>

      <div className={styles.chartGrid2}>
        <div>
          <h3 className={styles.muted} style={{ marginBottom: "0.5rem" }}>
            Дохід і продані копії по днях
          </h3>
          <div className={`${styles.chartBox} ${styles.chartBoxTall}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  stroke="#8fa3b8"
                  fontSize={10}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#7cb8ff"
                  fontSize={11}
                  width={48}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f472b6"
                  fontSize={11}
                  width={40}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#3b82f6"
                  name="Дохід (₴)"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="units"
                  stroke="#f472b6"
                  strokeWidth={2}
                  name="Копій ігор"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className={styles.muted} style={{ marginBottom: "0.5rem" }}>
            Кількість замовлень по днях
          </h3>
          <div className={`${styles.chartBox} ${styles.chartBoxTall}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  stroke="#8fa3b8"
                  fontSize={10}
                />
                <YAxis stroke="#8fa3b8" fontSize={11} allowDecimals={false} />
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
          <h3 className={styles.muted} style={{ marginBottom: "0.5rem" }}>
            Дохід (площа, 30 днів)
          </h3>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesChart}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7cb8ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7cb8ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  stroke="#8fa3b8"
                  fontSize={10}
                />
                <YAxis stroke="#8fa3b8" fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7cb8ff"
                  fill="url(#revGrad)"
                  name="Дохід ₴"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className={styles.muted} style={{ marginBottom: "0.5rem" }}>
            Статуси замовлень
          </h3>
          <div className={styles.chartBox}>
            {data.ordersStatusPie.length === 0 ? (
              <p className={styles.muted} style={{ padding: "2rem" }}>
                Немає замовлень для діаграми.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ordersStatusPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name ?? ""} ${(((percent ?? 0) * 100).toFixed(0))}%`
                    }
                  >
                    {data.ordersStatusPie.map((_, i) => (
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
      </div>

      <h3 className={styles.muted} style={{ marginBottom: "0.5rem" }}>
        Дохід — лінійний тренд (₴ / день)
      </h3>
      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.salesChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              stroke="#8fa3b8"
              fontSize={10}
            />
            <YAxis stroke="#8fa3b8" fontSize={11} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              name="Дохід"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className={styles.sectionTitle}>Топ ігор за кількістю продажів</h2>
      <div className={styles.chartGrid2}>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topForBar} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4d" />
              <XAxis type="number" stroke="#8fa3b8" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                stroke="#8fa3b8"
                fontSize={10}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="units" fill="#34d399" name="Копій" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.tableWrap} style={{ marginTop: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Гра</th>
                <th>Шт.</th>
              </tr>
            </thead>
            <tbody>
              {data.popularGames.length === 0 ? (
                <tr>
                  <td colSpan={2} className={styles.muted}>
                    Ще немає даних.
                  </td>
                </tr>
              ) : (
                data.popularGames.map((g) => (
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
    </div>
  );
}
