"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";
import bcryptjs from "bcryptjs";
import styles from "./account.module.css";

export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login flow
        await signIn("credentials", {
          redirect: true,
          email,
          password,
          callbackUrl: "/",
        });
      } else {
        // Registration flow
        if (password !== confirmPassword) {
          setErrorMessage("Паролі не збігаються");
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage("Пароль повинен мати мінімум 6 символів");
          setIsLoading(false);
          return;
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (existingUser) {
          setErrorMessage("Цей email вже зареєстрований");
          setIsLoading(false);
          return;
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user in Supabase
        const { error } = await supabase.from("users").insert([
          {
            email,
            password: hashedPassword,
            name: email.split("@")[0],
          },
        ]);

        if (error) {
          console.error("Registration error:", error);
          setErrorMessage("Помилка при реєстрації. Спробуйте ще раз.");
          setIsLoading(false);
          return;
        }

        // Success - show message and switch to login tab
        setSuccessMessage(
          "Реєстрація успішна! Тепер увійдіть у вашу сторінку."
        );
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsLogin(true);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setErrorMessage(error?.message || "Помилка обробки запиту");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      alert("Помилка входу через Google. Перевірте налаштування OAuth.");
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("github", { callbackUrl: "/" });
    } catch (error: any) {
      console.error("GitHub OAuth error:", error);
      alert("Помилка входу через GitHub. Перевірте налаштування OAuth.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1>EpicGame Shop</h1>
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${isLogin ? styles.active : ""}`}
            onClick={() => {
              setIsLogin(true);
              setErrorMessage("");
              setSuccessMessage("");
            }}
          >
            Вхід
          </button>
          <button
            className={`${styles.tab} ${!isLogin ? styles.active : ""}`}
            onClick={() => {
              setIsLogin(false);
              setErrorMessage("");
              setSuccessMessage("");
            }}
          >
            Реєстрація
          </button>
        </div>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
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

          <div className={styles.inputGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Підтвердіть пароль</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading
              ? "Завантаження..."
              : isLogin
              ? "Увійти"
              : "Зареєструватися"}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>або</span>
        </div>

        {/* Social Sign In */}
        <div className={styles.socialButtons}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg
              className={styles.socialIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Увійти через Google
          </button>

          <button
            type="button"
            className={styles.socialBtn}
            onClick={handleGitHubSignIn}
            disabled={isLoading}
          >
            <svg
              className={styles.socialIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Увійти через GitHub
          </button>
        </div>

        {isLogin && (
          <div className={styles.footer}>
            <p>
              Забули пароль? <a href="#">Відновити</a>
            </p>
          </div>
        )}

        <div className={styles.backLink}>
          <Link href="/">← Повернутися до магазину</Link>
        </div>
      </div>
    </div>
  );
}
