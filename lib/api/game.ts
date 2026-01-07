import { Game } from "@/types/game";

export const getSaleGames = (): Game[] => {
  return [
    {
      id: "1",
      title: "Battlefield™ 8",
      originalPrice: "1,499,000 ₴",
      discountedPrice: "1,189,30 грн.",
      discount: 20,
      imageUrl: "/images/games/battlefield.jpg",
      tags: ["Гостине", "Норвегія Liquacy"],
      developer: "EA DICE",
      platforms: ["Windows"],
    },
    {
      id: "2",
      title: "EA SPORTS FC™ 28 Standard Edition",
      originalPrice: "1,499,000 ₴",
      discountedPrice: "673,00 грн.",
      discount: 55,
      imageUrl: "/images/games/fc28.jpg",
      tags: ["Доступний пробний період"],
      developer: "EA Sports",
      platforms: ["Windows", "PlayStation"],
    },
    // ... інші ігри з скріна
  ];
};
