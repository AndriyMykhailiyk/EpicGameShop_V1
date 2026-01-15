"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./orders.module.css";

type OrderItem = {
  id: number;
  game_title: string;
  price: number;
  activation_key: string;
};

type Order = {
  id: number;
  order_number: string;
  email: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          email,
          total,
          created_at,
          order_items (
            id,
            game_title,
            price,
            activation_key
          )
        `
        )
        .order("created_at", { ascending: false });

      if (!error) setOrders(data as Order[]);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Завантаження...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мої замовлення</h1>

      {orders.map((order) => (
        <div key={order.id} className={styles.orderCard}>
          <h3>Замовлення {order.order_number}</h3>
          <p>Email: {order.email}</p>
          <p>Дата: {new Date(order.created_at).toLocaleString()}</p>
          <p>
            <strong>Сума:</strong> {order.total} грн
          </p>

          <div className={styles.items}>
            {order.order_items.map((item) => (
              <div key={item.id} className={styles.item}>
                <span>{item.game_title}</span>
                <span>{item.price} грн</span>
                <code>{item.activation_key}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
