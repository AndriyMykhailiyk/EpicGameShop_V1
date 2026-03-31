"use client";

import { type ReactNode, Children } from "react";
import { ScrollReveal } from "@/components/ui/animations";
import styles from "./HomeContent.module.css";

interface HomeContentProps {
  children: ReactNode;
}

/**
 * Home page content wrapper that provides scroll-reveal animations
 * and improved visual design for each section.
 *
 * Expects exactly 3 children: SaleGamesCarousel, BestOffer, MegaSaleSection
 */
export function HomeContent({ children }: HomeContentProps) {
  const sections = Children.toArray(children);

  return (
    <div className={styles.container}>
      <ScrollReveal direction="up" duration={0.5}>
        <header className={styles.heroHeader}>
          <div className={styles.heroHeaderContent}>
            <h1 className={styles.heroTitle}>
              Найліпше у літньому розпродажі
            </h1>
            <p className={styles.heroSubtitle}>
              Знижки до 90% на найкращі ігри сезону
            </p>
          </div>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgePulse} />
            <span className={styles.heroBadgeText}>LIVE</span>
          </div>
        </header>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.15} duration={0.5}>
        <section className={styles.section}>
          {sections[0]}
        </section>
      </ScrollReveal>

      <div className="section-divider" />

      <ScrollReveal direction="up" delay={0.1} duration={0.5}>
        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} section-heading`}>
            Пропозиції тижня
          </h2>
          {sections[1]}
        </section>
      </ScrollReveal>

      <div className="section-divider" />

      <ScrollReveal direction="up" delay={0.1} duration={0.5}>
        <section className={styles.section}>
          {sections[2]}
        </section>
      </ScrollReveal>
    </div>
  );
}
