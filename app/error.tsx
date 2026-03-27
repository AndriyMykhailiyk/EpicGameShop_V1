"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("Unhandled error:", error);
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <div
        style={{
          fontSize: "3rem",
          marginBottom: "1rem",
          opacity: 0.6,
        }}
      >
        ⚠️
      </div>

      <h2
        style={{
          fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
          fontWeight: 700,
          margin: "0 0 0.75rem",
        }}
      >
        Щось пішло не так
      </h2>

      <p
        style={{
          color: "#94a3b8",
          maxWidth: "480px",
          margin: "0 0 2rem",
          lineHeight: 1.6,
          fontSize: "0.9375rem",
        }}
      >
        Виникла несподівана помилка. Спробуйте перезавантажити сторінку або
        повернутися пізніше.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "0.75rem 2rem",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            fontWeight: 600,
            fontSize: "0.9375rem",
            cursor: "pointer",
            minHeight: "44px",
          }}
        >
          Спробувати знову
        </button>

        <a
          href="/"
          style={{
            padding: "0.75rem 2rem",
            background: "transparent",
            color: "#94a3b8",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: 500,
            fontSize: "0.9375rem",
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          На головну
        </a>
      </div>
    </div>
  );
}
