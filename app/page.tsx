import Image from "next/image";
import Link from "next/link";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";

export default function Home() {
  const saleGames: Game[] = getSaleGames();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Найліпше у літньому розпродажі
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {saleGames.map((game) => (
          <Link key={game.id} href={`/store/p/${game.id}`}>
            <div className="rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
              <div className="relative w-full">
                <Image
                  width={150}
                  height={200}
                  src={game.imageUrl}
                  alt={game.title}
                  className="object-cover"
                  priority
                />
              </div>

              <div>
                <p
                  style={{
                    fontSize: "12px",
                    paddingTop: "8px",
                    color: "#ffff11",
                  }}
                >
                  Основна гра
                </p>
                <h2 style={{ fontSize: 14 }}>{game.title}</h2>

                <div className="flex items-center gap-2 pt-3">
                  {game.discount && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      -{game.discount}%
                    </span>
                  )}
                </div>
              </div>
              <div style={{ gap: 10 }}>
                <span className="line-through text-gray-400 text-sm">
                  {game.originalPrice}
                </span>
                <span style={{ fontSize: 14 }}>{game.discountedPrice}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
