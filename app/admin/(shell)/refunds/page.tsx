"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../../admin.module.css";

interface RefundRow {
  id: string;
  order_id: string;
  email: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
  orders: {
    order_number: string;
    total: number | string;
    status: string;
  } | null;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds");
      if (!res.ok) throw new Error("fail");
      const j = await res.json();
      setRefunds(j.refunds ?? []);
    } catch {
      setMessage("Не вдалося завантажити запити на повернення.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/refunds/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminComment: adminComment || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Помилка оновлення.");
        return;
      }
      setProcessingId(null);
      setAdminComment("");
      await load();
      setMessage(
        status === "approved"
          ? "Повернення схвалено. Замовлення скасовано."
          : "Повернення відхилено.",
      );
    } catch {
      setMessage("Не вдалося оновити статус.");
    }
  };

  const filteredRefunds =
    filter === "all" ? refunds : refunds.filter((r) => r.status === filter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("uk-UA");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "На розгляді";
      case "approved":
        return "Схвалено";
      case "rejected":
        return "Відхилено";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#facc15";
      case "approved":
        return "#4ade80";
      case "rejected":
        return "#f87171";
      default:
        return "#94a3b8";
    }
  };

  const pendingCount = refunds.filter((r) => r.status === "pending").length;

  if (loading) {
    return <p className={styles.muted}>Завантаження…</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
        Запити на повернення
        {pendingCount > 0 && (
          <span
            style={{
              marginLeft: "0.75rem",
              background: "#facc15",
              color: "#000",
              padding: "0.125rem 0.625rem",
              borderRadius: "999px",
              fontSize: "0.875rem",
              fontWeight: 600,
              verticalAlign: "middle",
            }}
          >
            {pendingCount}
          </span>
        )}
      </h1>
      <p className={styles.muted}>
        Управління запитами на повернення коштів від користувачів.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.btn} ${filter === f ? styles.btnPrimary || "" : styles.btnGhost}`}
            style={
              filter === f
                ? { background: "#3b82f6", color: "#fff" }
                : undefined
            }
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "Усі"
              : f === "pending"
                ? "На розгляді"
                : f === "approved"
                  ? "Схвалені"
                  : "Відхилені"}
          </button>
        ))}
      </div>

      {message && <p style={{ marginTop: "0.75rem" }}>{message}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Замовлення</th>
              <th>Email</th>
              <th>Сума</th>
              <th>Причина</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filteredRefunds.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.muted}>
                  Запитів на повернення немає.
                </td>
              </tr>
            ) : (
              filteredRefunds.map((r) => (
                <tr key={r.id}>
                  <td>{r.orders?.order_number || "—"}</td>
                  <td>{r.email}</td>
                  <td>
                    {r.orders ? `${Number(r.orders.total).toFixed(2)} ₴` : "—"}
                  </td>
                  <td
                    style={{
                      maxWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={r.reason}
                  >
                    {r.reason}
                  </td>
                  <td>
                    <span style={{ color: getStatusColor(r.status), fontWeight: 600 }}>
                      {getStatusLabel(r.status)}
                    </span>
                  </td>
                  <td>{formatDate(r.created_at)}</td>
                  <td>
                    {r.status === "pending" ? (
                      processingId === r.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <input
                            type="text"
                            placeholder="Коментар (необов'язково)"
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            style={{
                              padding: "0.375rem 0.5rem",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: "0.25rem",
                              color: "#fff",
                              fontSize: "0.8125rem",
                            }}
                          />
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnGhost}`}
                              style={{ color: "#4ade80" }}
                              onClick={() => void handleAction(r.id, "approved")}
                            >
                              Схвалити
                            </button>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnGhost}`}
                              style={{ color: "#f87171" }}
                              onClick={() => void handleAction(r.id, "rejected")}
                            >
                              Відхилити
                            </button>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.btnGhost}`}
                              onClick={() => {
                                setProcessingId(null);
                                setAdminComment("");
                              }}
                            >
                              Скасувати
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={() => setProcessingId(r.id)}
                        >
                          Обробити
                        </button>
                      )
                    ) : (
                      <span className={styles.muted}>
                        {r.admin_comment || "—"}
                      </span>
                    )}
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
