import { Skeleton } from "@/components/ui/Skeleton";

export default function StoreLoading() {
  return (
    <div style={{ padding: "1rem" }}>
      <Skeleton width="100%" height="0" borderRadius="0.75rem" className="aspect-video" />
      <div style={{ height: "1.5rem" }} />
      <Skeleton width="200px" height="1.5rem" />
      <div style={{ height: "1rem" }} />
      <div style={{ display: "flex", gap: "1rem", overflow: "hidden" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width="200px" height="280px" borderRadius="0.5rem" />
        ))}
      </div>
    </div>
  );
}
