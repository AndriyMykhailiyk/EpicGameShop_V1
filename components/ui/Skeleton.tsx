import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

/**
 * Animated placeholder for loading content.
 * @example <Skeleton width="100%" height="200px" borderRadius="0.75rem" />
 */
export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "0.375rem",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton width="100%" height="0" borderRadius="0.75rem 0.75rem 0 0" className={styles.cardImage} />
      <div className={styles.cardBody}>
        <Skeleton width="75%" height="1rem" />
        <Skeleton width="50%" height="0.75rem" />
        <Skeleton width="40%" height="0.75rem" />
        <div className={styles.cardFooter}>
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="25%" height="0.875rem" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
