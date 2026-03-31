"use client";

import { MegaSaleTimer } from "./MegaSaleTimercomp";
import { Game } from "@/types/game";
import GameImage from "@/components/ui/GameImage";
import Link from "next/link";
import styles from "./MegaSaleCard.module.css";

type Props = {
  game: Game;
};

export const MegaSaleCard = ({ game }: Props) => {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>MEGA SALE</div>

      <div className={styles.imageBox}>
        <GameImage
          src={game.imageUrl}
          alt={game.title}
          fill
          sizes="96px"
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.info}>
        <div>
          <Link href={`/store/p/${game.id}`} className={styles.titleLink}>
            <h2 className={styles.title}>{game.title}</h2>
          </Link>
          <div className={styles.priceRow}>
            <span className={styles.oldPrice}>{game.originalPrice}</span>
            <span className={styles.newPrice}>{game.discountedPrice}</span>
          </div>
        </div>

        <MegaSaleTimer saleEndsAt={game.saleEndsAt!} />
      </div>
    </div>
  );
};
