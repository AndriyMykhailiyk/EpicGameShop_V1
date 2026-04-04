import { Skeleton, SkeletonGrid } from "@/components/ui/Skeleton";

export default function GamesLoading() {
  return (
    <div style={{ padding: "1rem" }}>
      <Skeleton width="220px" height="2rem" />
      <div style={{ height: "1.5rem" }} />
      <SkeletonGrid count={8} />
    </div>
  );
}
