"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GameImage from "@/components/ui/GameImage";
import styles from "./saved.module.css";

interface SavedGame {
  id: string;
  title: string;
  image: string;
  price: {
    current: number;
    original?: number;
  };
}

export default function SavedGamesPage() {
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Завантажуємо збережені ігри з localStorage
    const saved = localStorage.getItem("savedGames");
    if (saved) {
      setSavedGames(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const removeSavedGame = (gameId: string) => {
    const updated = savedGames.filter((game) => game.id !== gameId);
    setSavedGames(updated);
    localStorage.setItem("savedGames", JSON.stringify(updated));
  };

  if (isLoading) {
    return <div className={styles.loading}>Завантаження...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Збережені ігри</h1>
      </div>

      {savedGames.length === 0 ? (
        <div className={styles.empty}>
          <p>У вас немає збережених ігор</p>
          <Link href="/store" className={styles.shopLink}>
            Перейти до магазину
          </Link>
        </div>
      ) : (
        <div className={styles.gamesList}>
          {savedGames.map((game) => (
            <div key={game.id} className={styles.gameCard}>
              <GameImage
                src={game.image}
                alt={game.title}
                width={300}
                height={170}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={styles.gameImage}
                loading="lazy"
              />
              <div className={styles.gameInfo}>
                <h3>{game.title}</h3>
                <div className={styles.price}>
                  <span className={styles.currentPrice}>
                    {typeof game.price.current === "number"
                      ? `${game.price.current.toFixed(2)} грн`
                      : `${game.price.current} грн`}
                  </span>
                  {game.price.original && (
                    <span className={styles.originalPrice}>
                      {typeof game.price.original === "number"
                        ? `${game.price.original.toFixed(2)} грн`
                        : `${game.price.original} грн`}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                <Link href={`/store/p/${game.id}`} className={styles.viewBtn}>
                  Переглянути
                </Link>
                <button
                  onClick={() => removeSavedGame(game.id)}
                  className={styles.removeBtn}
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
