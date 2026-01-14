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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Найліпше у літньому розпродажі
      </h1>

      <SaleGamesCarousel games={saleGames} />
      <br />
      <BestOffer />
      <br /> 
      <MegaSaleSection/>
    </div>
  );
}
