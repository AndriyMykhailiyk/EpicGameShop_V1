"use client";

import { motion } from "framer-motion";
import styles from "./AmbientGlow.module.css";

/**
 * Decorative ambient glow orbs for the main content background.
 * Creates a subtle, animated gradient atmosphere behind the page content.
 */
export default function AmbientGlow() {
  return (
    <div className={styles.container} aria-hidden="true">
      <motion.div
        className={`${styles.orb} ${styles.orbPrimary}`}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`${styles.orb} ${styles.orbSecondary}`}
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 40, -60, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`${styles.orb} ${styles.orbAccent}`}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
