import { Skeleton, SkeletonGrid } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div style={{ padding: "1rem" }}>
      <Skeleton width="280px" height="1.75rem" />
      <div style={{ height: "1rem" }} />
      <div style={{ display: "flex", gap: "1rem", overflow: "hidden" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width="180px" height="260px" borderRadius="0.5rem" />
        ))}
      </div>
      <div style={{ height: "2rem" }} />
      <SkeletonGrid count={3} />
    </div>
  );
}
