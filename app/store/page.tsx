import { loadCatalogGames } from "@/lib/catalog/loadGames";
import StorePageClient from "./StorePageClient";

export const revalidate = 300;

export default async function StorePage() {
  const games = await loadCatalogGames();
  return <StorePageClient games={games} />;
}
