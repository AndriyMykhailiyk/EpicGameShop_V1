"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedMainProps {
  children: ReactNode;
  className?: string;
}

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/**
 * Animated wrapper for the main content area.
 * Provides a smooth fade + slide entrance animation on mount.
 * Uses `initial={false}` after first render to avoid re-animating
 * on client-side navigations handled by Next.js App Router.
 *
 * @param children - Page content to animate
 * @param className - Additional CSS classes
 */
export default function AnimatedMain({ children, className }: AnimatedMainProps) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: EASE_OUT,
        },
      }}
    >
      {children}
    </motion.main>
  );
}
