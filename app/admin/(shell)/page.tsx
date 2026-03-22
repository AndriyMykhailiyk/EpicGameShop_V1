"use client";

import { useEffect, useState } from "react";
import type { AdminDashboardPayload } from "@/lib/admin/dashboardTypes";
import AdminDashboardClient from "../_components/AdminDashboardClient";
import styles from "../admin.module.css";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardPayload | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) {
          throw new Error("load failed");
        }
        const j = (await res.json()) as AdminDashboardPayload;
        if (!cancelled) {
          setData(j);
        }
      } catch {
        if (!cancelled) {
          setErr("Не вдалося завантажити дані панелі.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return <p style={{ color: "#f87171" }}>{err}</p>;
  }

  if (!data) {
    return <p className={styles.muted}>Завантаження…</p>;
  }

  return <AdminDashboardClient data={data} />;
}
