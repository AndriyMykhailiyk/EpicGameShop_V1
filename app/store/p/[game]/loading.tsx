import { Skeleton } from "@/components/ui/Skeleton";

export default function GameDetailLoading() {
  return (
    <div style={{ padding: "1rem" }}>
      <Skeleton width="300px" height="0.875rem" />
      <div style={{ height: "1.5rem" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
        }}
      >
        <Skeleton width="100%" height="0" borderRadius="0.75rem" className="aspect-video" />
        <div>
          <Skeleton width="70%" height="2rem" />
          <div style={{ height: "1rem" }} />
          <Skeleton width="40%" height="0.875rem" />
          <div style={{ height: "0.5rem" }} />
          <Skeleton width="35%" height="0.875rem" />
          <div style={{ height: "0.5rem" }} />
          <Skeleton width="30%" height="0.875rem" />
          <div style={{ height: "1.5rem" }} />
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width="80px" height="1.75rem" borderRadius="0.25rem" />
            ))}
          </div>
          <div style={{ height: "1.5rem" }} />
          <Skeleton width="50%" height="2rem" />
          <div style={{ height: "1rem" }} />
          <Skeleton width="100%" height="3rem" borderRadius="0.5rem" />
        </div>
      </div>
    </div>
  );
}
