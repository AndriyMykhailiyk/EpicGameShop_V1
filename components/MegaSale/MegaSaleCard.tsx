"use client";

import { MegaSaleTimer } from "./MegaSaleTimercomp";
import { Game } from "@/types/game";
import Link from "next/link";
type Props = {
  game: Game;
};

export const MegaSaleCard = ({ game }: Props) => {
  return (
    <div className="relative flex gap-4 p-3 rounded-xl bg-gradient-to-br from-[#120d0d] to-[#1a1010] border border-red-900/50 hover:border-red-500 transition">
      
      {/* Badge */}
      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
        MEGA SALE
      </div>

      {/* Image */}
      <img
        src={game.imageUrl}
        alt={game.title}
        className="w-24 h-32 object-cover rounded-lg"
      />

      {/* Info */}
      <div className="flex flex-col justify-between flex-1">
        <div>
        <Link href={`/store/p/${game.id}`}>

          <h2 className="text-2xl font-semibold leading-tight line-clamp-2">
            {game.title}
          </h2>
         
</Link >
          <div className="flex items-center gap-2 mt-1">
            <span className="line-through text-xs text-gray-500">
              {game.originalPrice}
            </span>
            <span className="text-red-500 font-bold text-sm">
              {game.discountedPrice}
            </span>
          </div>
        </div>

        <MegaSaleTimer saleEndsAt={game.saleEndsAt!} />
      </div>
    </div>
  );
};
