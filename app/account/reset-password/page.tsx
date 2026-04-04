"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "../account.module.css";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1>EpicGame Shop</h1>
          </div>
          <div className={styles.errorMessage}>
            Невірне посилання для скидання пароля. Запросіть нове.
          </div>
          <div className={styles.backLink}>
            <Link href="/account/forgot-password">
              Запросити нове посилання
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Паролі не збігаються");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Пароль повинен мати мінімум 6 символів");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Помилка. Спробуйте ще раз.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMessage("Не вдалося скинути пароль. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1>EpicGame Shop</h1>
          </div>
          <div className={styles.successMessage}>
            Пароль успішно змінено! Тепер ви можете увійти з новим паролем.
          </div>
          <div
            style={{ textAlign: "center", marginTop: "1.5rem" }}
          >
            <Link
              href="/account"
              style={{
                color: "#0099ff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Перейти до входу →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1>EpicGame Shop</h1>
        </div>

        <h2
          style={{
            textAlign: "center",
            color: "#cbd5e0",
            fontSize: "1.125rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          Новий пароль
        </h2>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Новий пароль</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Підтвердіть пароль</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Зберігаємо..." : "Зберегти новий пароль"}
          </button>
        </form>

        <div className={styles.backLink}>
          <Link href="/account">← Повернутися до входу</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <p style={{ color: "#a0aec0", textAlign: "center" }}>
              Завантаження...
            </p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
