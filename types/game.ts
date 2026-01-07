export interface Game {
  id: string;
  title: string;
  originalPrice: string; // "1,499,000 ₴"
  discountedPrice: string; // "1,189,30 грн."
  discount?: number; // 20 (процент)
  imageUrl: string;
  tags: string[]; // ["Гостине", "Норвегія Liquacy", ...]
  developer?: string;
  publisher?: string;
  rating?: string;
  isEarlyAccess?: boolean;
  isFree?: boolean;
  platforms: string[]; // ["Windows", "Mac"]
  releaseDate?: string;
  description?: string;
}

export interface SaleSection {
  id: string;
  title: string;
  subtitle?: string;
  games: Game[];
  endDate: string;
}

export interface FilterOptions {
  priceRange: [number, number];
  platforms: string[];
  genres: string[];
  features: string[];
  sortBy: "popular" | "newest" | "price-low" | "price-high";
}
