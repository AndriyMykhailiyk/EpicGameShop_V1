"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin",
      });
      if (res?.error) {
        setError("Невірний email або пароль, або акаунт заблоковано.");
        setLoading(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Помилка входу. Спробуйте ще раз.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Вхід адміністратора</h1>
        <p className={styles.muted} style={{ marginBottom: "1.25rem" }}>
          Використовуйте облікові дані з файлу README (змініть пароль у
          production).
        </p>
        {error && (
          <p style={{ color: "#f87171", marginBottom: "0.75rem" }}>{error}</p>
        )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password">Пароль</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Вхід…" : "Увійти"}
          </button>
        </form>
        <p className={styles.muted} style={{ marginTop: "1.25rem" }}>
          <Link href="/">← На головну</Link>
        </p>
      </div>
    </div>
  );
}
