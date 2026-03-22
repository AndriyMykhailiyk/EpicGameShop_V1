"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../../admin.module.css";

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  status: string;
  total: number | string;
  created_at: string;
  order_items: {
    id: string;
    game_title: string;
    quantity: number;
    line_total: number | string;
  }[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        throw new Error("fail");
      }
      const j = await res.json();
      setOrders(j.orders ?? []);
    } catch {
      setMessage("Не вдалося завантажити замовлення.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: "paid" | "pending") => {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("fail");
      }
      await load();
    } catch {
      setMessage("Не вдалося оновити статус.");
    }
  };

  if (loading) {
    return <p className={styles.muted}>Завантаження…</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
        Управління замовленнями
      </h1>
      <p className={styles.muted}>
        Усі замовлення з бази; статуси «оплачено» та «очікує».
      </p>
      {message && <p style={{ marginTop: "0.75rem" }}>{message}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Номер</th>
              <th>Email</th>
              <th>Дата</th>
              <th>Сума</th>
              <th>Статус</th>
              <th>Товари</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.muted}>
                  Замовлень ще немає.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.email}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td>{Number(o.total).toFixed(2)} ₴</td>
                  <td>{o.status === "paid" ? "оплачено" : "очікує"}</td>
                  <td>
                    {(o.order_items ?? [])
                      .map((li) => `${li.game_title} ×${li.quantity}`)
                      .join("; ")}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost}`}
                        onClick={() => void setStatus(o.id, "paid")}
                      >
                        Оплачено
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost}`}
                        onClick={() => void setStatus(o.id, "pending")}
                      >
                        Очікує
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
