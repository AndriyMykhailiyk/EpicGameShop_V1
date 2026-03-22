"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./store.module.css";
import { Game } from "@/types/game";
import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";

type Props = { games: Game[] };

export default function StorePageClient({ games }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeGames = games.length > 0 ? games : [];
  const activeGame = safeGames[activeIndex] ?? safeGames[0];
  const saleGames = safeGames;
  const topPlayed = [...safeGames].slice(-4).reverse();

  useEffect(() => {
    if (safeGames.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeGames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [safeGames.length]);

  if (!activeGame) {
    return (
      <div className={styles.container}>
        <p>Каталог порожній.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
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
            <div key={activeIndex} className={styles.progress}></div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <h1>Великак картинка вішліст</h1>

          {safeGames.map((game, idx) => (
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

      <section className={styles.topPlayedSection}>
        <h2 className={styles.topPlayedSectionTitle}>Найбільше грають {">"}</h2>
        <ul className={styles.topPlayedListPage}>
          {topPlayed.map((g) => (
            <li key={g.id} className={styles.topPlayedItemPage}>
              <Link
                href={`/store/p/${g.id}`}
                className={styles.topPlayedLinkPage}
              >
                <Image
                  src={g.imageUrl}
                  alt={g.title}
                  width={60}
                  height={60}
                  className={styles.topPlayedImagePage}
                />
                <div className={styles.topPlayedTextPage}>
                  <span className={styles.topPlayedNamePage}>{g.title}</span>
                  <span className={styles.topPlayedPricePage}>
                    {g.discountedPrice}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
