import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0f1f",
        color: "#fff",
        padding: "2rem 1rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "clamp(5rem, 15vw, 10rem)", fontWeight: 800, lineHeight: 1, color: "#3b82f6", marginBottom: "0.5rem" }}>
        404
      </div>

      <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)", fontWeight: 700, margin: "0 0 0.75rem" }}>
        Сторінку не знайдено
      </h1>

      <p style={{ color: "#94a3b8", fontSize: "clamp(0.875rem, 2vw, 1.125rem)", maxWidth: "480px", margin: "0 0 2rem", lineHeight: 1.6 }}>
        Схоже, ця сторінка загубилася серед ігрових світів. Перевірте адресу або
        поверніться на головну.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            padding: "0.75rem 2rem",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9375rem",
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            transition: "background 0.2s",
          }}
        >
          На головну
        </Link>
        <Link
          href="/discover"
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
            transition: "border-color 0.2s, color 0.2s",
          }}
        >
          Каталог ігор
        </Link>
      </div>
    </div>
  );
}
