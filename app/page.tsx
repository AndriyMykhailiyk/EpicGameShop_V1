import Image from "next/image";
import Link from "next/link";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";
import BestOffer from "@/components/ui/grid/BestOffer";
import { MegaSaleSection } from "@/components/MegaSale/MegaSaleSection";

export default function Home() {
  const saleGames: Game[] = getSaleGames();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Найліпше у літньому розпродажі
      </h1>

      <SaleGamesCarousel games={saleGames} />

      <div className="h-4 sm:h-6" />

      <BestOffer />

      <div className="h-4 sm:h-6" />

      <MegaSaleSection />
    </div>
  );
}
