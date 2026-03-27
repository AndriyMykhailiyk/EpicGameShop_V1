import { Skeleton, SkeletonGrid } from "@/components/ui/Skeleton";

export default function DiscoverLoading() {
  return (
    <div style={{ padding: "1rem", maxWidth: "100%" }}>
      <Skeleton width="200px" height="2rem" />
      <div style={{ height: "0.5rem" }} />
      <Skeleton width="320px" height="1rem" />
      <div style={{ height: "1.5rem" }} />
      <SkeletonGrid count={8} />
    </div>
  );
}
