import Image from "next/image";
import Link from "next/link";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";

export default function Home() {
  const saleGames: Game[] = getSaleGames();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Найліпше у літньому розпродажі
      </h1>

      <SaleGamesCarousel games={saleGames} />
    </div>
  );
}
