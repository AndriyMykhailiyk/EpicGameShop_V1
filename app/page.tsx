import SaleGamesCarousel from "@/components/ui/carusel/SaleGamesCarousel";
import BestOffer from "@/components/ui/grid/BestOffer";
import { MegaSaleSection } from "@/components/MegaSale/MegaSaleSection";
import { loadCatalogGames } from "@/lib/catalog/loadGames";

export const revalidate = 300;

export default async function Home() {
  const saleGames = await loadCatalogGames();

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Найліпше у літньому розпродажі
      </h1>

      <SaleGamesCarousel games={saleGames} />

      <div className="h-4 sm:h-6" />

      <BestOffer />

      <div className="h-4 sm:h-6" />

      <MegaSaleSection games={saleGames} />
    </div>
  );
}
