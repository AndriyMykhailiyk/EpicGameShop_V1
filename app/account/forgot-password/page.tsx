"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../account.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Помилка. Спробуйте ще раз.");
        setIsLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setErrorMessage("Не вдалося відправити запит. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1>EpicGame Shop</h1>
        </div>

        {sent ? (
          <div>
            <div className={styles.successMessage}>
              Якщо акаунт з таким email існує, ми відправили лист з
              інструкціями для відновлення пароля.
            </div>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link
                href="/account"
                style={{
                  color: "#0099ff",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                ← Повернутися до входу
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2
              style={{
                textAlign: "center",
                color: "#cbd5e0",
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Відновлення пароля
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#a0aec0",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              Введіть ваш email і ми надішлемо посилання для скидання пароля
            </p>

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? "Відправка..." : "Надіслати посилання"}
              </button>
            </form>

            <div className={styles.backLink}>
              <Link href="/account">← Повернутися до входу</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
