"use client";

import Link from "next/link";
import GameImage from "@/components/ui/GameImage";
import { RecentlyViewedGame } from "@/lib/hooks/useRecentlyViewed";
import styles from "./RecentlyViewed.module.css";

interface RecentlyViewedProps {
  games: RecentlyViewedGame[];
}

/**
 * Horizontal scrollable strip of recently viewed game cards.
 * Renders nothing when the list is empty.
 */
export default function RecentlyViewed({ games }: RecentlyViewedProps) {
  if (games.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Переглянуті товари</h2>

      <div className={styles.scrollWrapper}>
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/store/p/${encodeURIComponent(game.id)}`}
            className={styles.card}
          >
            <div className={styles.imageWrap}>
              <GameImage
                src={game.imageUrl}
                alt={game.title}
                fill
                sizes="180px"
                className="object-cover"
                loading="lazy"
              />
              {game.discount && game.discount > 0 && (
                <span className={styles.discountBadge}>
                  -{game.discount}%
                </span>
              )}
            </div>

            <div className={styles.info}>
              <p className={styles.gameTitle}>{game.title}</p>
              <div className={styles.prices}>
                <span className={styles.currentPrice}>
                  {game.discountedPrice}
                </span>
                {game.originalPrice &&
                  game.originalPrice !== game.discountedPrice && (
                    <span className={styles.originalPrice}>
                      {game.originalPrice}
                    </span>
                  )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
