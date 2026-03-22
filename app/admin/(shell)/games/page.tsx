"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game } from "@/types/game";
import styles from "../../admin.module.css";

type RowBundle = { row: Record<string, unknown>; game: Game };

const emptyForm = {
  id: "",
  title: "",
  originalPrice: "",
  discountedPrice: "",
  discount: 0,
  imageUrl: "",
  tags: "",
  developer: "",
  publisher: "",
  platforms: "",
  description: "",
  isMegaSale: false,
  saleEndsAt: "",
};

export default function AdminGamesPage() {
  const [rows, setRows] = useState<RowBundle[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/games");
      if (!res.ok) {
        throw new Error("fail");
      }
      const j = await res.json();
      setRows(j.games ?? []);
    } catch {
      setMessage("Не вдалося завантажити ігри.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const parseList = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const body = {
        id: form.id.trim(),
        title: form.title.trim(),
        originalPrice: form.originalPrice,
        discountedPrice: form.discountedPrice,
        discount: Number(form.discount) || 0,
        imageUrl: form.imageUrl.trim(),
        tags: parseList(form.tags),
        developer: form.developer.trim() || undefined,
        publisher: form.publisher.trim() || undefined,
        platforms: parseList(form.platforms),
        description: form.description.trim() || undefined,
        isMegaSale: form.isMegaSale,
        saleEndsAt: (() => {
          if (!form.saleEndsAt.trim()) {
            return null;
          }
          const d = new Date(form.saleEndsAt);
          return Number.isNaN(d.getTime()) ? null : d.toISOString();
        })(),
      };
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `/api/admin/games/${encodeURIComponent(editingId)}`
        : "/api/admin/games";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "save failed");
      }
      setMessage("Збережено.");
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Помилка збереження гри.",
      );
    }
  };

  const startEdit = (g: Game) => {
    setEditingId(g.id);
    setForm({
      id: g.id,
      title: g.title,
      originalPrice: g.originalPrice,
      discountedPrice: g.discountedPrice,
      discount: g.discount ?? 0,
      imageUrl: g.imageUrl,
      tags: (g.tags || []).join(", "),
      developer: g.developer ?? "",
      publisher: g.publisher ?? "",
      platforms: (g.platforms || []).join(", "),
      description: g.description ?? "",
      isMegaSale: Boolean(g.isMegaSale),
      saleEndsAt: g.saleEndsAt
        ? g.saleEndsAt.slice(0, 16)
        : "",
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Деактивувати гру в каталозі?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/games/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("delete failed");
      }
      await load();
    } catch {
      setMessage("Не вдалося видалити гру.");
    }
  };

  if (loading) {
    return <p className={styles.muted}>Завантаження…</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Управління іграми</h1>
      <p className={styles.muted}>
        Додавання, редагування та деактивація ігор у каталозі Supabase.
      </p>

      {message && <p style={{ marginTop: "0.75rem" }}>{message}</p>}

      <h2 style={{ marginTop: "1.5rem" }}>
        {editingId ? "Редагування" : "Нова гра"}
      </h2>
      <form className={styles.form} onSubmit={submit}>
        <div>
          <label>ID (slug, унікальний)</label>
          <input
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            required
            disabled={Boolean(editingId)}
          />
        </div>
        <div>
          <label>Назва</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Ціна до знижки (текст)</label>
          <input
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Поточна ціна (текст)</label>
          <input
            value={form.discountedPrice}
            onChange={(e) =>
              setForm({ ...form, discountedPrice: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label>Знижка %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={form.discount}
            onChange={(e) =>
              setForm({ ...form, discount: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label>URL зображення</label>
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Теги (через кому)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div>
          <label>Розробник</label>
          <input
            value={form.developer}
            onChange={(e) => setForm({ ...form, developer: e.target.value })}
          />
        </div>
        <div>
          <label>Видавець</label>
          <input
            value={form.publisher}
            onChange={(e) => setForm({ ...form, publisher: e.target.value })}
          />
        </div>
        <div>
          <label>Платформи (через кому)</label>
          <input
            value={form.platforms}
            onChange={(e) => setForm({ ...form, platforms: e.target.value })}
          />
        </div>
        <div>
          <label>Опис</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.isMegaSale}
            onChange={(e) => setForm({ ...form, isMegaSale: e.target.checked })}
          />
          Мега-акція
        </label>
        <div>
          <label>Кінець акції (datetime-local)</label>
          <input
            type="datetime-local"
            value={form.saleEndsAt}
            onChange={(e) => setForm({ ...form, saleEndsAt: e.target.value })}
          />
        </div>
        <div className={styles.rowActions}>
          <button type="submit" className={styles.btn}>
            Зберегти
          </button>
          {editingId && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Скасувати
            </button>
          )}
        </div>
      </form>

      <h2 style={{ marginTop: "2rem" }}>Каталог</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Назва</th>
              <th>Активна</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const active = r.row.is_active !== false;
              return (
                <tr key={r.game.id}>
                  <td>{r.game.id}</td>
                  <td>{r.game.title}</td>
                  <td>{active ? "так" : "ні"}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost}`}
                        onClick={() => startEdit(r.game)}
                      >
                        Редагувати
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnDanger}`}
                        onClick={() => remove(r.game.id)}
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
