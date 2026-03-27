import type { Metadata } from "next";
import { loadCatalogGames } from "@/lib/catalog/loadGames";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = {
  title: "Каталог ігор — Epic Games Store",
  description:
    "Переглядайте, фільтруйте та знаходьте ідеальну гру. Знижки, безкоштовні ігри, МЕГА АКЦІЇ та ексклюзиви.",
};

export default async function DiscoverPage() {
  const games = await loadCatalogGames();

  return <DiscoverClient games={games} />;
}
