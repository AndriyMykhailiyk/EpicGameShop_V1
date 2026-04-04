"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./refunds.module.css";

interface OrderForRefund {
  id: string;
  order_number: string;
  email: string;
  total: number | string;
  status: string;
  created_at: string;
}

interface RefundRequest {
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
  };
}

export default function RefundsPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Завантаження...</div>}>
      <RefundsContent />
    </Suspense>
  );
}

function RefundsContent() {
  const { data: session, status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const preselectedOrderNumber = searchParams.get("orderNumber");

  const [orders, setOrders] = useState<OrderForRefund[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [autoOpened, setAutoOpened] = useState(false);

  const loadData = useCallback(async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    setError("");

    try {
      const [refundsRes, ordersFromStorage] = await Promise.all([
        fetch("/api/refunds"),
        Promise.resolve(loadOrdersFromStorage()),
      ]);

      if (refundsRes.ok) {
        const data = await refundsRes.json();
        setRefunds(data.refunds ?? []);
      }

      setOrders(ordersFromStorage);
    } catch {
      setError("Не вдалося завантажити дані");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      void loadData();
    } else if (authStatus === "unauthenticated") {
      setLoading(false);
    }
  }, [authStatus, loadData]);

  useEffect(() => {
    if (autoOpened || !preselectedOrderNumber || orders.length === 0) return;

    const match = orders.find(
      (o) => o.order_number === preselectedOrderNumber,
    );
    if (match) {
      setRefundingOrderId(match.id);
      setAutoOpened(true);

      setTimeout(() => {
        document
          .getElementById(`refund-form-${match.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [preselectedOrderNumber, orders, autoOpened]);

  const loadOrdersFromStorage = (): OrderForRefund[] => {
    try {
      const raw = localStorage.getItem("userOrders");
      if (!raw) return [];
      const parsed = JSON.parse(raw) as OrderForRefund[];
      return parsed.filter((o) => !o.status || o.status === "paid");
    } catch {
      return [];
    }
  };

  const handleSubmitRefund = async () => {
    if (!refundingOrderId || reason.length < 10) return;

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: refundingOrderId, reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Помилка при створенні запиту");
        setSubmitting(false);
        return;
      }

      setSuccessMessage("Запит на повернення успішно створено!");
      setRefundingOrderId(null);
      setReason("");
      await loadData();
    } catch {
      setError("Не вдалося створити запит на повернення");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "approved":
        return styles.statusApproved;
      case "rejected":
        return styles.statusRejected;
      default:
        return "";
    }
  };

  if (authStatus === "loading" || loading) {
    return <div className={styles.loading}>Завантаження...</div>;
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Увійдіть в акаунт для перегляду повернень</p>
          <Link href="/account" className={styles.shopLink}>
            Увійти
          </Link>
        </div>
      </div>
    );
  }

  const refundedOrderIds = new Set(refunds.map((r) => r.order_id));
  const eligibleOrders = orders.filter((o) => !refundedOrderIds.has(o.id));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Повернення коштів</h1>
      <p className={styles.subtitle}>
        Створіть запит на повернення коштів або перевірте статус існуючих
      </p>

      {error && <div className={styles.error}>{error}</div>}
      {successMessage && (
        <div
          style={{
            padding: "1rem",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "0.5rem",
            color: "#4ade80",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          {successMessage}
        </div>
      )}

      {refunds.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Мої запити на повернення</h2>
          {refunds.map((refund) => (
            <div key={refund.id} className={styles.refundCard}>
              <div className={styles.refundMeta}>
                <div>
                  <strong>{refund.orders?.order_number || "—"}</strong>
                  <span style={{ color: "#94a3b8", marginLeft: "0.75rem" }}>
                    {formatDate(refund.created_at)}
                  </span>
                </div>
                <span
                  className={`${styles.statusBadge} ${getStatusClass(refund.status)}`}
                >
                  {getStatusLabel(refund.status)}
                </span>
              </div>
              <p className={styles.refundReason}>
                <strong>Причина:</strong> {refund.reason}
              </p>
              {refund.admin_comment && (
                <div className={styles.adminComment}>
                  <strong>Відповідь адміністратора:</strong>{" "}
                  {refund.admin_comment}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Замовлення, доступні для повернення</h2>
        {eligibleOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Немає замовлень, доступних для повернення</p>
            <Link href="/store" className={styles.shopLink}>
              Перейти до магазину
            </Link>
          </div>
        ) : (
          eligibleOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3>{order.order_number}</h3>
                  <p>{formatDate(order.created_at)}</p>
                </div>
                <span className={styles.orderTotal}>
                  {Number(order.total).toFixed(2)} грн
                </span>
              </div>

              {refundingOrderId === order.id ? (
                <div id={`refund-form-${order.id}`} className={styles.refundForm}>
                  <label
                    htmlFor={`reason-${order.id}`}
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    Причина повернення (мінімум 10 символів)
                  </label>
                  <textarea
                    id={`reason-${order.id}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Опишіть причину, чому ви хочете повернути кошти..."
                    disabled={submitting}
                  />
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.submitRefund}
                      onClick={handleSubmitRefund}
                      disabled={submitting || reason.length < 10}
                    >
                      {submitting ? "Відправка..." : "Надіслати запит"}
                    </button>
                    <button
                      type="button"
                      className={styles.cancelRefund}
                      onClick={() => {
                        setRefundingOrderId(null);
                        setReason("");
                      }}
                      disabled={submitting}
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.refundBtn}
                  onClick={() => setRefundingOrderId(order.id)}
                >
                  Запросити повернення
                </button>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
