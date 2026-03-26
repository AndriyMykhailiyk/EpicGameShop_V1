"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GameImage from "@/components/ui/GameImage";
import { getSaleGames } from "@/lib/api/game";
import styles from "./GamesPage.module.css";

interface Game {
  price: any;
  image: any;
  id: string;
  title: string;
  originalPrice: string;
  discountedPrice: string;
  discount?: number;
  imageUrl: string;
  tags: string[];
  developer?: string;
  publisher?: string;
  rating?: string;
  isEarlyAccess?: boolean;
  isFree?: boolean;
  platforms: string[];
  releaseDate?: string;
  description?: string;
  isMegaSale?: boolean;
  saleEndsAt?: string;
}

const PRICE_FILTERS = [
  { label: "До 100 ₴", max: 100 },
  { label: "До 300 ₴", max: 300 },
  { label: "До 600 ₴", max: 600 },
];

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/games/catalog");
        if (!res.ok) {
          throw new Error("catalog");
        }
        const data = await res.json();
        if (!cancelled) {
          setGames((data.games ?? []) as Game[]);
        }
      } catch {
        if (!cancelled) {
          setGames(getSaleGames() as Game[]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allPlatforms = Array.from(
    new Set(games.flatMap((g) => g.platforms || []))
  );

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const byPlatform = selectedPlatform
        ? game.platforms?.includes(selectedPlatform)
        : true;

      const byPrice = priceMax
        ? (game.price?.current || 0) <= priceMax
        : true;

      return byPlatform && byPrice;
    });
  }, [games, selectedGenre, selectedPlatform, priceMax]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Увесь асортимент</h1>

      <div className={styles.grid}>
        {filteredGames.map((game) => (
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
    </div>
  );
}
