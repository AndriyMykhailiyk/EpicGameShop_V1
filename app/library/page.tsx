"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./library.module.css";

type PurchasedGame = {
  id: string;
  title: string;
  image?: string;
  developer?: string;
  publisher?: string;
  genres?: string[];
  platforms?: string[];
  purchasedAt?: string; // ISO date
};

export default function LibraryPage() {
  const [games, setGames] = useState<PurchasedGame[]>([]);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [gameToRemove, setGameToRemove] = useState<PurchasedGame | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("purchasedGames") || "[]";
    try {
      const parsed = JSON.parse(raw) as PurchasedGame[];
      setGames(parsed || []);
    } catch (e) {
      setGames([]);
    }
  }, []);

  const allGenres = Array.from(new Set(games.flatMap((g) => g.genres || [])));
  const allPlatforms = Array.from(
    new Set(games.flatMap((g) => g.platforms || []))
  );

  const filtered = games
    .filter((g) => g.title.toLowerCase().includes(query.toLowerCase()))
    .filter((g) =>
      genreFilter ? (g.genres || []).includes(genreFilter) : true
    )
    .filter((g) =>
      platformFilter ? (g.platforms || []).includes(platformFilter) : true
    );

  const sorted = filtered.sort((a, b) => {
    if (sortBy === "alpha") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "developer") {
      return (a.developer || "").localeCompare(b.developer || "");
    }
    // date
    const da = a.purchasedAt ? Date.parse(a.purchasedAt) : 0;
    const db = b.purchasedAt ? Date.parse(b.purchasedAt) : 0;
    return db - da;
  });
  const removeGame = (id: string) => {
    const updatedGames = games.filter((g) => g.id !== id);
    setGames(updatedGames);
    localStorage.setItem("purchasedGames", JSON.stringify(updatedGames));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Моя бібліотека</h1>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Пошук за назвою..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">Усі жанри</option>
          {allGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">Усі платформи</option>
          {allPlatforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.select}
        >
          <option value="date">За датою (новіші)</option>
          <option value="alpha">За алфавітом</option>
          <option value="developer">За розробником</option>
        </select>
      </div>

      <div className={styles.grid}>
        {sorted.length === 0 ? (
          <div className={styles.empty}>У вас немає придбаних ігор</div>
        ) : (
          sorted.map((g) => (
            <div key={g.id} className={styles.card}>
              <Link href={`/store/p/${g.id}`} className={styles.cardLink}>
                <div className={styles.imageWrap}>
                  {g.image ? (
                    <Image
                      src={g.image}
                      alt={g.title}
                      width={150}
                      height={200}
                      sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 150px"
                      className={styles.image}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.placeholder} />
                  )}
                </div>
                <div className={styles.cardTitle}>{g.title}</div>
              </Link>

              <button
                className={styles.removeBtn}
                onClick={() => setGameToRemove(g)}
              >
                Видалити
              </button>
            </div>
          ))
        )}
      </div>
      {gameToRemove && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Видалити гру з бібліотеки?</h3>

            <p className={styles.modalText}>
              «{gameToRemove.title}» буде видалено з вашої бібліотеки.
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.confirmBtn}
                onClick={() => {
                  removeGame(gameToRemove.id);
                  setGameToRemove(null);
                }}
              >
                Видалити
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => setGameToRemove(null)}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
