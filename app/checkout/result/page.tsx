"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

interface OrderItem {
  game_id: string;
  game_title: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  activation_key: string | null;
}

interface OrderData {
  orderNumber: string;
  email: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  items: OrderItem[];
}

type PageStatus = "loading" | "paid" | "pending" | "error";

const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 5000;

/**
 * Payment result page shown after LiqPay redirect.
 * Polls the order status until payment is confirmed or times out.
 */
export default function CheckoutResultPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const fetchOrderStatus = useCallback(async (): Promise<OrderData | null> => {
    try {
      const res = await fetch(`/api/payment/liqpay/status/${orderId}`);
      if (!res.ok) return null;
      return (await res.json()) as OrderData;
    } catch {
      return null;
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setPageStatus("error");
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const poll = async () => {
      const data = await fetchOrderStatus();

      if (cancelled) return;

      if (!data) {
        setPageStatus("error");
        return;
      }

      setOrderData(data);

      if (data.status === "paid") {
        setPageStatus("paid");
        return;
      }

      setPollCount((prev) => {
        const next = prev + 1;
        if (next >= MAX_POLL_ATTEMPTS) {
          setPageStatus("pending");
          return next;
        }
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        return next;
      });
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [orderId, fetchOrderStatus]);

  if (pageStatus === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <h1 className={styles.title}>Перевіряємо оплату...</h1>
          <p className={styles.subtitle}>
            Зачекайте, ми підтверджуємо ваш платіж ({pollCount}/{MAX_POLL_ATTEMPTS})
          </p>
        </div>
      </div>
    );
  }

  if (pageStatus === "error") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconError}>✕</div>
          <h1 className={styles.title}>Помилка</h1>
          <p className={styles.subtitle}>
            Не вдалося знайти інформацію про замовлення.
          </p>
          <Link href="/" className={styles.button}>
            Повернутися до магазину
          </Link>
        </div>
      </div>
    );
  }

  if (pageStatus === "pending") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconPending}>⏳</div>
          <h1 className={styles.title}>Оплата в обробці</h1>
          <p className={styles.subtitle}>
            Замовлення <strong>{orderData?.orderNumber}</strong> створено, але
            оплата ще не підтверджена. Перевірте пізніше або зверніться до підтримки.
          </p>
          <Link href="/" className={styles.button}>
            Повернутися до магазину
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconSuccess}>✓</div>
        <h1 className={styles.title}>Оплата успішна!</h1>
        <p className={styles.subtitle}>
          Замовлення <strong>{orderData?.orderNumber}</strong> оплачено.
          Ключі активації надіслано на <strong>{orderData?.email}</strong>.
        </p>

        {orderData && orderData.items.length > 0 && (
          <div className={styles.receipt}>
            <h2 className={styles.receiptTitle}>Ваші ігри</h2>
            <ul className={styles.gameList}>
              {orderData.items.map((item, idx) => (
                <li key={idx} className={styles.gameItem}>
                  <div className={styles.gameHeader}>
                    <span className={styles.gameTitle}>{item.game_title}</span>
                    <span className={styles.gamePrice}>
                      {item.line_total.toFixed(2)} грн
                    </span>
                  </div>
                  {item.activation_key && (
                    <div className={styles.keyRow}>
                      <span className={styles.keyLabel}>Ключ:</span>
                      <code className={styles.keyValue}>{item.activation_key}</code>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className={styles.totalRow}>
              <span>Всього:</span>
              <strong>{orderData.total.toFixed(2)} грн</strong>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/library" className={styles.button}>
            Моя бібліотека
          </Link>
          <Link href="/" className={styles.buttonSecondary}>
            Повернутися до магазину
          </Link>
        </div>
      </div>
    </div>
  );
}
