"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { Game } from "@/types/game";
import styles from "./SaleGamesCarousel.module.css";

type Props = {
  games: Game[];
};

export default function SaleGamesCarousel({ games }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 2,
    align: "start",
    loop: false,
  });

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <div className={styles.container}>
      {/* Кнопки */}
      <div className={styles.buttonsContainer}>
        <button onClick={scrollPrev} className={styles.scrollButton}>
          ←
        </button>
        <button onClick={scrollNext} className={styles.scrollButton}>
          →
        </button>
      </div>

      {/* Карусель */}
      <div ref={emblaRef} className={styles.carousel}>
        <div className={styles.carouselTrack}>
          {games.map((game) => (
            <div key={game.id} className={styles.gameItem}>
              <Link href={`/store/p/${game.id}`}>
                <div className={styles.gameCard}>
                  <Image
                    src={game.imageUrl}
                    alt={game.title}
                    width={100}
                    height={150}
                    className={styles.gameImage}
                  />

                  <div className={styles.gameInfo}>
                    <p className={styles.gameLabel}>Основна гра</p>
                    <h2 className={styles.gameTitle}>{game.title}</h2>

                    <div className={styles.discountContainer}>
                      {game.discount && (
                        <span className={styles.discountBadge}>
                          -{game.discount}%
                        </span>
                      )}
                    </div>

                    <div className={styles.priceContainer}>
                      <span className={styles.originalPrice}>
                        {game.originalPrice}
                      </span>
                      <span className={styles.currentPrice}>
                        {game.discountedPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
