"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import { addToCart } from "@/lib/store/cartSlice";
import { showToast } from "@/components/ui/Toast";
import System_requirements from "@/components/ui/cards/Systemrequirements";
export default function GamePage() {
  const params = useParams();
  const gameId = params.game as string;
  const dispatch = useDispatch();
  const router = useRouter();

  const allGames = getSaleGames();
  const game = allGames.find((g) => g.id === gameId);

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
        title: game.title,
        imageUrl: game.imageUrl,
        originalPrice: game.originalPrice,
        discountedPrice: game.discountedPrice,
        discount: game.discount,
        description: game.description,
      })
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

  return (
    <div className="p-6">
      <Link href="/" className="text-blue-500 hover:underline mb-6 block">
        ← Повернутися до магазину
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Зображення гри */}
        <div>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
            <Image
              src={game.imageUrl}
              alt={game.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Інформація про гру */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{game.title}</h1>

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
              <span className="line-through text-gray-400 text-xl">
                {game.originalPrice}
              </span>
              <span className="text-3xl font-bold">{game.discountedPrice}</span>
              {game.discount && (
                <span className="bg-red-600 text-white px-3 py-1 rounded font-bold">
                  -{game.discount}%
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Купити гру
            </button>
          </div>
          <div style={{ width: "250px" }}>
            <button
              onClick={handleAddToWishlist}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-2 rounded-lg transition-colors w-full flex items-center justify-center gap-2 mt-4"
            >
              <Image
                src="/save.png"
                alt="User profile"
                width={20}
                height={20}
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

      {/* Опис */}
      {game.description && (
        <div className="mt-12 border-t border-gray-700 pt-8">
          <h2 className="text-2xl font-bold mb-4">Про гру</h2>
          <p className="text-gray-300 leading-relaxed">{game.description}</p>
        </div>
      )}

      {/* System requirements */}
      <System_requirements />
    </div>
  );
}
