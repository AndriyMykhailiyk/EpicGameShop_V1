"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../../admin.module.css";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  blocked: boolean;
};

type OrderLine = {
  id: string;
  game_title: string;
  quantity: number;
  line_total: number | string;
};

type OrderRow = {
  id: string;
  order_number: string;
  total: number | string;
  status: string;
  created_at: string;
  order_items: OrderLine[] | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("fail");
      }
      const j = await res.json();
      setUsers(j.users ?? []);
    } catch {
      setMessage("Не вдалося завантажити користувачів.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const toggleBlock = async (u: UserRow) => {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(u.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !u.blocked }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "fail");
      }
      await loadUsers();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Не вдалося оновити користувача.",
      );
    }
  };

  const openHistory = async (u: UserRow) => {
    setSelected(u);
    setOrders([]);
    setOrdersLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(u.id)}/orders`,
      );
      if (!res.ok) {
        throw new Error("fail");
      }
      const j = await res.json();
      setOrders(j.orders ?? []);
    } catch {
      setMessage("Не вдалося завантажити історію покупок.");
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading) {
    return <p className={styles.muted}>Завантаження…</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
        Управління користувачами
      </h1>
      <p className={styles.muted}>
        Перегляд списку, блокування облікових записів та історія замовлень.
      </p>
      {message && <p style={{ marginTop: "0.75rem" }}>{message}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Ім&apos;я</th>
              <th>Адмін</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name ?? "—"}</td>
                <td>{u.is_admin ? "так" : "ні"}</td>
                <td>{u.blocked ? "заблоковано" : "активний"}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnGhost}`}
                      onClick={() => void openHistory(u)}
                      disabled={u.is_admin}
                    >
                      Історія покупок
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${
                        u.blocked ? styles.btnGhost : styles.btnDanger
                      }`}
                      onClick={() => void toggleBlock(u)}
                      disabled={u.is_admin}
                    >
                      {u.blocked ? "Розблокувати" : "Заблокувати"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem" }}>
            Замовлення: {selected.email}
          </h2>
          {ordersLoading ? (
            <p className={styles.muted}>Завантаження…</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Номер</th>
                    <th>Дата</th>
                    <th>Сума</th>
                    <th>Статус</th>
                    <th>Товари</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.muted}>
                        Немає збережених замовлень.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.order_number}</td>
                        <td>{new Date(o.created_at).toLocaleString()}</td>
                        <td>{Number(o.total).toFixed(2)} ₴</td>
                        <td>{o.status}</td>
                        <td>
                          {(o.order_items ?? [])
                            .map(
                              (li) =>
                                `${li.game_title} ×${li.quantity}`,
                            )
                            .join("; ")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
