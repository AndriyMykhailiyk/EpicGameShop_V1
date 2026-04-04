import { Skeleton } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <div style={{ padding: "1rem" }}>
      <Skeleton width="180px" height="2rem" />
      <div style={{ height: "1.5rem" }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "0.75rem",
          }}
        >
          <Skeleton width="100px" height="140px" borderRadius="0.5rem" />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="1.25rem" />
            <div style={{ height: "0.5rem" }} />
            <Skeleton width="40%" height="0.875rem" />
            <div style={{ height: "0.5rem" }} />
            <Skeleton width="25%" height="1rem" />
          </div>
        </div>
      ))}
      <div style={{ height: "1rem" }} />
      <Skeleton width="200px" height="2.5rem" borderRadius="0.5rem" />
    </div>
  );
}
