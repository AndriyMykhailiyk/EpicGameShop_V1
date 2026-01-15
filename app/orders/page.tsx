"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./orders.module.css";
import { useRouter } from "next/navigation";

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
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мої замовлення</h1>
    </div>
  );
}
