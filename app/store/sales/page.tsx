import HeroSection from "@/components/ui/sections/HeroSection";
import GameGrid from "@/components/ui/grid/GameGrid";
import FilterSidebar from "@/components/ui/filters/FilterSidebar";
import WeeklyOffer from "@/components/ui/sections/WeeklyOffer";
import { getSaleGames } from "@/lib/api/game";

export default function SalesPage() {
  const games = getSaleGames(); // Мок дані

  return (
    <div className="sales-page">
      <HeroSection
        title="Найліпше у Святковому розпродажі"
        subtitle="ВАТТІ ЕFIELD 6"
        tags={["Гостине", "Норвегія Liquacy", "Птич Nights at Freddy's Inn"]}
      />

      <div className="content-wrapper">
        <FilterSidebar />
        <div className="main-content">
          <GameGrid games={games} />
          <WeeklyOffer />
        </div>
      </div>
    </div>
  );
}
