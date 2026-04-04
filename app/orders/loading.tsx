import { Skeleton } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div style={{ padding: "1rem" }}>
      <Skeleton width="220px" height="2rem" />
      <div style={{ height: "1.5rem" }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            marginBottom: "1rem",
            padding: "1.25rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Skeleton width="180px" height="1rem" />
              <div style={{ height: "0.5rem" }} />
              <Skeleton width="140px" height="0.75rem" />
            </div>
            <Skeleton width="100px" height="1.25rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
