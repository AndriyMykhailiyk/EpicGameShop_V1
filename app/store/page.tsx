"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./store.module.css";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";
export default function StorePage() {
  const games = getSaleGames();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeGame = games[activeIndex];
  const saleGames: Game[] = getSaleGames();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % games.length);
    }, 10000); // 10 секунд
    return () => clearInterval(interval);
  }, [games.length]);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {/* Велика картинка */}
        <div className={styles.hero}>
          <h1>Великак картинка вішліст</h1>
          <Image
            src={activeGame.imageUrl}
            alt={activeGame.title}
            fill
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>{activeGame.title}</h1>
            {activeGame.tags && activeGame.tags.length > 0 && (
              <div className={styles.tags}>
                {activeGame.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className={styles.priceSection}>
              {activeGame.originalPrice && (
                <span className={styles.originalPrice}>
                  {activeGame.originalPrice}
                </span>
              )}
              <span className={styles.currentPrice}>
                {activeGame.discountedPrice}
              </span>
            </div>
          </div>
          <div className={styles.progressBar}>
            <div
              key={activeIndex} // щоб анімація скидалась
              className={styles.progress}
            ></div>
          </div>
        </div>

        {/* Список ігор праворуч */}
        <div className={styles.sidebar}>
          <h1>Великак картинка вішліст</h1>

          {games.map((game, idx) => (
            <div
              key={game.id}
              className={`${styles.sidebarItem} ${
                idx === activeIndex ? styles.activeItem : ""
              }`}
              onClick={() => setActiveIndex(idx)}
            >
              <Image
                src={game.imageUrl}
                alt={game.title}
                width={60}
                height={80}
                className={styles.sidebarImage}
              />
              <span className={styles.sidebarTitle}>{game.title}</span>
            </div>
          ))}
        </div>
      </div>
      <br />
      <div className={styles.saleGamesContainer}>
        <SaleGamesCarousel games={saleGames} />
      </div>
    </div>
  );
}
// <SaleGamesCarousel games={saleGames} />
