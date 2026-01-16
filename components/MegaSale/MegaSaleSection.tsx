"use client";

import { getSaleGames } from "../../lib/api//game";
import { MegaSaleCard } from "./MegaSaleCard";

export const MegaSaleSection = () => {
  const megaSaleGames = getSaleGames().filter(
    (game) => game.isMegaSale
  );

  return (
    <section className="space-y-4">
        <div style={{padding: "30px 0px" }}>
      <h2 className="text-3xl font-bold text-red-500">
        🔥 МЕГА АКЦІЇ (обмежений час)
      </h2>
<br/>
      <div className="grid md:grid-cols-2 gap-4">
        {megaSaleGames.map((game) => (
          <MegaSaleCard key={game.id} game={game} />
        ))}
      </div>
      </div>
    </section>
  );
};
