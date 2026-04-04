"use client";

import type { Game } from "@/types/game";
import { MegaSaleCard } from "./MegaSaleCard";
import { StaggerContainer, StaggerItem } from "@/components/ui/animations";
import styles from "./MegaSaleSection.module.css";

type Props = { games: Game[] };

export const MegaSaleSection = ({ games }: Props) => {
  const megaSaleGames = games.filter((game) => game.isMegaSale);

  if (megaSaleGames.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.fireIcon} aria-hidden="true">
          <span className={styles.fireEmoji}>🔥</span>
        </div>
        <div>
          <h2 className={styles.title}>МЕГА АКЦІЇ</h2>
          <p className={styles.subtitle}>Обмежений час — встигни купити!</p>
        </div>
      </div>

      <StaggerContainer className={styles.grid} staggerDelay={0.15}>
        {megaSaleGames.map((game) => (
          <StaggerItem key={game.id}>
            <MegaSaleCard game={game} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
};
