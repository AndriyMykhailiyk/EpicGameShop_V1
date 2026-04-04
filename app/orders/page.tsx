"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./orders.module.css";

type OrderItem = {
  id: string;
  game_title: string;
  quantity: number;
  price: number;
  activation_key: string;
};

type Order = {
  id?: string;
  orderNumber: string;
  email: string;
  total: number;
  subtotal: number;
  tax: number;
  status?: string;
  created_at: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem("userOrders");
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders);
      const sorted = parsed.sort(
        (a: Order, b: Order) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sorted);
    }
  }, []);

  const toggleOrder = (orderNumber: string) => {
    setExpandedOrder(expandedOrder === orderNumber ? null : orderNumber);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPaid = (order: Order) => {
    return !order.status || order.status === "paid";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мої замовлення</h1>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>У вас поки немає замовлень</p>
          <a href="/" className={styles.shopLink}>
            Перейти до магазину
          </a>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.orderNumber} className={styles.orderCard}>
              <button
                type="button"
                className={styles.orderHeader}
                onClick={() => toggleOrder(order.orderNumber)}
                aria-expanded={expandedOrder === order.orderNumber}
              >
                <div className={styles.orderHeaderLeft}>
                  <h3 className={styles.orderNumber}>{order.orderNumber}</h3>
                  <p className={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className={styles.orderHeaderRight}>
                  <p className={styles.orderTotal}>
                    {order.total.toFixed(2)} грн
                  </p>
                  <span className={styles.expandButton} aria-hidden="true">
                    {expandedOrder === order.orderNumber ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {expandedOrder === order.orderNumber && (
                <div className={styles.orderDetails}>
                  <div className={styles.orderInfo}>
                    <p>
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p>
                      <strong>Кількість товарів:</strong> {order.items.length}
                    </p>
                  </div>

                  <div className={styles.itemsList}>
                    <h4>Куплені ігри:</h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} className={styles.orderItem}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemTitle}>
                            {item.game_title}
                          </span>
                          <span className={styles.itemQuantity}>
                            x{item.quantity}
                          </span>
                          <span className={styles.itemPrice}>
                            {item.price.toFixed(2)} грн
                          </span>
                        </div>
                        <div className={styles.itemKey}>
                          <strong>Ключ активації:</strong>
                          <code>{item.activation_key}</code>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                      <span>Підсумок:</span>
                      <span>{order.subtotal.toFixed(2)} грн</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>ПДВ (20%):</span>
                      <span>{order.tax.toFixed(2)} грн</span>
                    </div>
                    <div className={styles.summaryRowTotal}>
                      <span>Всього:</span>
                      <strong>{order.total.toFixed(2)} грн</strong>
                    </div>
                  </div>

                  {isPaid(order) && (
                    <div className={styles.refundLinkWrap}>
                      <Link
                        href={`/refunds?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                        className={styles.refundLink}
                      >
                        ↩ Запросити повернення коштів
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
