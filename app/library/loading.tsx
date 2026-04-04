import { Skeleton } from "@/components/ui/Skeleton";

export default function LibraryLoading() {
  return (
    <div style={{ padding: "1rem" }}>
      <Skeleton width="220px" height="2rem" />
      <div style={{ height: "1rem" }} />
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <Skeleton width="200px" height="2.5rem" borderRadius="0.5rem" />
        <Skeleton width="140px" height="2.5rem" borderRadius="0.5rem" />
        <Skeleton width="140px" height="2.5rem" borderRadius="0.5rem" />
        <Skeleton width="160px" height="2.5rem" borderRadius="0.5rem" />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton width="100%" height="200px" borderRadius="0.5rem" />
            <div style={{ height: "0.5rem" }} />
            <Skeleton width="80%" height="0.875rem" />
          </div>
        ))}
      </div>
    </div>
  );
}
