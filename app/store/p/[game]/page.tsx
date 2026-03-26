"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import { addToCart } from "@/lib/store/cartSlice";
import { showToast } from "@/components/ui/Toast";
import dynamic from "next/dynamic";

const System_requirements = dynamic(
  () => import("@/components/ui/cards/Systemrequirements"),
  { loading: () => <div className="h-64 animate-pulse bg-gray-800 rounded-lg mt-12" /> }
);

const GameRatingReviews = dynamic(
  () => import("@/components/GameRating/GameRatingReviews"),
  { loading: () => <div className="h-48 animate-pulse bg-gray-800 rounded-lg mt-8" /> }
);

const GameDescription = dynamic(
  () => import("@/components/ui/cartabout/AboutGame"),
  { loading: () => <div className="h-40 animate-pulse bg-gray-800 rounded-2xl mt-8" /> }
);
export default function GamePage() {
  const params = useParams();
  const gameId = params.game as string;
  const dispatch = useDispatch();
  const router = useRouter();
  const [catalog, setCatalog] = useState<Game[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/games/catalog");
        if (!res.ok) {
          throw new Error("catalog");
        }
        const data = await res.json();
        if (!cancelled) {
          setCatalog((data.games ?? []) as Game[]);
        }
      } catch {
        if (!cancelled) {
          setCatalog(getSaleGames());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allGames = catalog ?? [];
  const game = allGames.find((g) => g.id === gameId);

  if (catalog === null) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Завантаження…</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-6">
        <p className="text-red-500">Гра не знайдена</p>
        <Link href="/" className="text-blue-500 hover:underline">
          ← Повернутися до магазину
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: game.id,
        price: game.price,
        title: game.title,
        imageUrl: game.imageUrl,
        originalPrice: game.originalPrice,
        discountedPrice: game.discountedPrice,
        discount: game.discount,
        description: game.description,
      }),
    );
    showToast(`"${game.title}" додано до кошика`);
  };

  const handleAddToWishlist = () => {
    const savedGames = JSON.parse(localStorage.getItem("savedGames") || "[]");

    // Перевіряємо, чи гра вже в списку бажаного
    const gameExists = savedGames.some((g: any) => g.id === game.id);

    if (!gameExists) {
      savedGames.push({
        id: game.id,
        title: game.title,
        image: game.imageUrl,
        price: {
          current: game.discountedPrice,
          original: game.originalPrice,
        },
        developer: game.developer,
        publisher: game.publisher,
        releaseDate: game.releaseDate,
        rating: game.rating,
        platforms: game.platforms,
        tags: game.tags,
        description: game.description,
        isEarlyAccess: game.isEarlyAccess,
        isFree: game.isFree,
      });
      localStorage.setItem("savedGames", JSON.stringify(savedGames));
      showToast(`"${game.title}" додано до списку бажаного`);
    } else {
      showToast(`"${game.title}" вже в списку бажаного`);
    }

    router.push("/saved");
  };

  const purchasedIds =
    typeof window !== "undefined"
      ? (
          JSON.parse(localStorage.getItem("purchasedGames") || "[]") as any[]
        ).map((g) => g.id)
      : [];

  const isPurchased = (id: string) => purchasedIds.includes(id);

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <Link href="/" className="text-blue-500 hover:underline mb-4 sm:mb-6 block min-h-[44px] flex items-center">
        ← Повернутися до магазину
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {/* Зображення гри */}
        <div>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
            <Image
              src={game.imageUrl}
              alt={game.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Інформація про гру */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{game.title}</h1>

          {game.developer && (
            <p className="text-gray-400 mb-2">
              <span className="font-semibold">Розробник:</span> {game.developer}
            </p>
          )}

          {game.publisher && (
            <p className="text-gray-400 mb-4">
              <span className="font-semibold">Видавець:</span> {game.publisher}
            </p>
          )}

          {game.releaseDate && (
            <p className="text-gray-400 mb-4">
              <span className="font-semibold">Дата випуску:</span>{" "}
              {game.releaseDate}
            </p>
          )}

          {game.rating && (
            <p className="text-gray-400 mb-4">
              <span className="font-semibold">Рейтинг:</span> {game.rating}
            </p>
          )}

          {game.platforms && game.platforms.length > 0 && (
            <p className="text-gray-400 mb-4">
              <span className="font-semibold">Платформи:</span>{" "}
              {game.platforms.join(", ")}
            </p>
          )}

          {game.tags && game.tags.length > 0 && (
            <div className="mb-6">
              <p className="font-semibold mb-2">Теги:</p>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ціна */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="line-through text-gray-400 text-base sm:text-xl">
                {game.originalPrice}
              </span>
              <span className="text-2xl sm:text-3xl font-bold">{game.discountedPrice}</span>
              {game.discount && (
                <span className="bg-red-600 text-white px-3 py-1 rounded font-bold">
                  -{game.discount}%
                </span>
              )}
            </div>
            {isPurchased(game.id) ? (
              <Link
                href="/library"
                className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors min-h-[44px] flex items-center justify-center"
              >
                Перейти в бібліотеку
              </Link>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors min-h-[44px]"
              >
                Купити гру
              </button>
            )}
          </div>
          <div className="w-full sm:w-[250px]">
            <button
              onClick={handleAddToWishlist}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors w-full flex items-center justify-center gap-2 mt-4 min-h-[44px]"
            >
              <Image
                src="/save.png"
                alt="Wishlist"
                width={20}
                height={20}
                sizes="20px"
              />
              Список бажаного
            </button>
          </div>

          {game.isEarlyAccess && (
            <div className="mt-4 bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded">
              ⚠️ Ранній доступ
            </div>
          )}

          {game.isFree && (
            <div className="mt-4 bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded">
              ✓ Безкоштовна гра
            </div>
          )}
        </div>
      </div>
      {game.description && (
        <GameDescription
          description={game.description}
          title={game.title}
          developer={game.developer}
          tags={game.tags}
          platforms={game.platforms}
          rating={4.5} // Тут можна передати реальний рейтинг з вашого API
          estimatedPlayTime="25-40 годин" // Можна додати це поле до типу Game
          multiplayer={game.tags?.some(
            (tag) =>
              tag.includes("кооператив") ||
              tag.includes("мультиплеєр") ||
              game.title.includes("Battlefield") ||
              game.title.includes("Fortnite"),
          )}
          maxHeight="400px"
          className="mt-8"
        />
      )}
      <GameRatingReviews gameId={game.id} gameTitle={game.title} />

      {/* System requirements */}
      <System_requirements />
    </div>
  );
}
