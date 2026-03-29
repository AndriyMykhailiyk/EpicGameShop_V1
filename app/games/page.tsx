"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import GameImage from "@/components/ui/GameImage";
import type { Game } from "@/types/game";
import styles from "./GamesPage.module.css";

const ITEMS_PER_PAGE = 20;

const PRICE_FILTERS = [
  { label: "До 100 ₴", max: 100 },
  { label: "До 300 ₴", max: 300 },
  { label: "До 600 ₴", max: 600 },
];

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/games/catalog");
        if (!res.ok) throw new Error("catalog");
        const data = await res.json();
        if (!cancelled) setGames(data.games ?? []);
      } catch {
        if (!cancelled) {
          const { getSaleGames } = await import("@/lib/api/game");
          setGames(getSaleGames());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allPlatforms = useMemo(
    () => Array.from(new Set(games.flatMap((g) => g.platforms || []))),
    [games],
  );

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (selectedPlatform && !game.platforms?.includes(selectedPlatform)) {
        return false;
      }
      if (priceMax) {
        const cleaned = game.discountedPrice
          ?.replace(/[^\d.,]/g, "")
          .replace(/,/g, ".");
        const price = parseFloat(cleaned || "0") || 0;
        if (price > priceMax) return false;
      }
      return true;
    });
  }, [games, selectedPlatform, priceMax]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedPlatform, priceMax]);

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const visibleGames = filteredGames.slice(0, visibleCount);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Увесь асортимент</h1>

      <div className={styles.grid}>
        {visibleGames.map((game) => (
          <div key={game.id} className={styles.card}>
            <Link href={`/store/p/${game.id}`} className={styles.cardLink}>
              {game.imageUrl && (
                <GameImage
                  src={game.imageUrl}
                  alt={game.title}
                  width={300}
                  height={170}
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className={styles.image}
                  loading="lazy"
                />
              )}
              <div className={styles.cardBody}>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.price}>{game.discountedPrice}</span>
                  {game.originalPrice && (
                    <span className={styles.oldPrice}>{game.originalPrice}</span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {visibleCount < filteredGames.length && (
        <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
          <button
            onClick={handleShowMore}
            style={{
              padding: "0.75rem 2.5rem",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.9375rem",
              cursor: "pointer",
              minHeight: "44px",
              transition: "background 0.2s",
            }}
          >
            Показати ще ({filteredGames.length - visibleCount} залишилось)
          </button>
        </div>
      )}
    </div>
  );
}
