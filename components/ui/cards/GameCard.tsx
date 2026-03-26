import GameImage from "@/components/ui/GameImage";
import { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="game-card">
      <div className="game-card-image">
        <GameImage
          src={game.imageUrl}
          alt={game.title}
          width={300}
          height={170}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>
      <div className="game-card-content">
        <h3 className="game-title">{game.title}</h3>
        {game.tags && game.tags.length > 0 && (
          <div className="game-tags">
            {game.tags.map((tag, index) => (
              <span key={index} className="game-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="game-prices">
          <span className="original-price">{game.originalPrice}</span>
          <span className="discounted-price">{game.discountedPrice}</span>
        </div>
      </div>
    </div>
  );
}
