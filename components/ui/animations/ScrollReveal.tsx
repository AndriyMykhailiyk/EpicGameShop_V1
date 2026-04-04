"use client";

import { motion, useInView, type Variant } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
}

const directionOffsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

/**
 * Scroll-triggered reveal animation component.
 * Wraps children and animates them into view when they enter the viewport.
 *
 * @param direction - Direction the element slides from (default: "up")
 * @param delay - Animation delay in seconds (default: 0)
 * @param duration - Animation duration in seconds (default: 0.5)
 * @param distance - Slide distance in pixels (default: 40)
 * @param once - Whether to animate only once (default: true)
 * @param threshold - Viewport intersection threshold 0-1 (default: 0.15)
 */
export default function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 40,
  once = true,
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const offset = directionOffsets[direction];

  const hidden: Variant = {
    opacity: 0,
    x: offset.x * distance,
    y: offset.y * distance,
  };

  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={hidden}
      animate={isInView ? visible : hidden}
    >
      {children}
    </motion.div>
  );
}
