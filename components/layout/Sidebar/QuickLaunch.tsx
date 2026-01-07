import { quickLaunchGames } from "@/lib/data/quickLaunch";
import Image from "next/image";

export default function QuickLaunch() {
  return (
    <div className="quick-launch">
      <h3 className="section-title">Швидкий запуск</h3>
      <div className="games-list">
        {quickLaunchGames.map((game: any) => (
          <div key={game.id} className="quick-game">
            <Image
              src={game.icon}
              alt={game.name}
              width={32}
              height={32}
              className="game-icon"
            />
            <span className="game-name">{game.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
