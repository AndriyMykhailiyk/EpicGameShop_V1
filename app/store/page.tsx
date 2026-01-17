"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./store.module.css";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";

export default function StorePage() {
  const games = getSaleGames();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const activeGame = games[activeIndex];
  const saleGames: Game[] = getSaleGames();
  const topPlayed = games.slice(-4).reverse();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % games.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [games.length]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {/* Велика картинка */}
        <div className={styles.hero}>
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

        {/* Список ігор - справа на десктопі, знизу на мобілках */}
        <div className={styles.sidebar}>
          {isMobile && (
            <h2 className={styles.sidebarMobileTitle}>Всі ігри в списку</h2>
          )}

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
                width={isMobile ? 120 : 60}
                height={isMobile ? 160 : 80}
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

      {/* Секція: Найбільше грають */}
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
