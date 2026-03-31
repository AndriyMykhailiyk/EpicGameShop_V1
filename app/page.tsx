import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";
import BestOffer from "@/components/ui/grid/BestOffer";
import { MegaSaleSection } from "@/components/MegaSale/MegaSaleSection";
import { loadCatalogGames } from "@/lib/catalog/loadGames";
import { HomeContent } from "@/components/home/HomeContent";

export const revalidate = 300;

export default async function Home() {
  const saleGames = await loadCatalogGames();

  return (
    <HomeContent>
      <SaleGamesCarousel games={saleGames} />
      <BestOffer />
      <MegaSaleSection games={saleGames} />
    </HomeContent>
  );
}
