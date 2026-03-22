"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getSaleGames } from "@/lib/api/game";
import styles from './GamesPage.module.css'
// Умовні типи – підлаштуй під свої
interface Game {
    price: any;
    image: any;
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
    isMegaSale?: boolean;
    saleEndsAt?: string;
  
}

const PRICE_FILTERS = [
  { label: "До 100 ₴", max: 100 },
  { label: "До 300 ₴", max: 300 },
  { label: "До 600 ₴", max: 600 },
];

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);

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
          setGames((data.games ?? []) as Game[]);
        }
      } catch {
        if (!cancelled) {
          setGames(getSaleGames() as Game[]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allPlatforms = Array.from(
    new Set(games.flatMap((g) => g.platforms || []))
  );

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {

      const byPlatform = selectedPlatform
        ? game.platforms?.includes(selectedPlatform)
        : true;

      const byPrice = priceMax
        ? (game.price?.current || 0) <= priceMax
        : true;

      return  byPlatform && byPrice;
    });
  }, [games, selectedGenre, selectedPlatform, priceMax]);

  return (
    <div className="page">
      <h1 className="title">Увесь асортимент</h1>

      {/* Фільтри */}
    

      {/* Сітка ігор */}
      <motion.div layout className="grid">
  <AnimatePresence>
    {filteredGames.map((game) => (
 <motion.div layout key={game.id} className={styles.grid}>
 {filteredGames.map(game => (
   <motion.div key={game.id} layout className={styles.card}>
     <Link href={`/store/p/${game.id}`} className={styles.cardLink}>
       {game.imageUrl && (
         <Image src={game.imageUrl} alt={game.title} width={300} height={170} className={styles.image}/>
       )}
       <div className={styles.cardBody}>
         <h3>{game.title}</h3>
         <p>{game.description}</p>
         <div className={styles.cardFooter}>
           <span className={styles.price}>{game.discountedPrice}</span>
           {game.originalPrice && (
             <span className={styles.oldPrice}>{game.originalPrice}</span>
           )}
         </div>
       </div>
     </Link>
   </motion.div>
 ))}
</motion.div>
    ))}
  </AnimatePresence>
</motion.div>


      <style jsx>{`
        .page {
          padding: 40px;
          background: radial-gradient(circle at top, #1b1f3b, #0d0f1f);
          min-height: 100vh;
          color: #fff;
        }

        .title {
          font-size: 36px;
          margin-bottom: 24px;
        }

        .filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.04);
          padding: 20px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .filterBlock span {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .chip:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        .chip.active {
          background: linear-gradient(135deg, #6d5dfc, #c77dff);
          border-color: transparent;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }

        .card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
        }

        .cardLink {
          color: inherit;
          text-decoration: none;
          display: block;
          height: 100%;
        }

        .image {
          object-fit: cover;
        }

        .cardBody {
          padding: 16px;
        }

        .cardBody h3 {
          font-size: 18px;
          margin-bottom: 6px;
        }

        .cardBody p {
          font-size: 14px;
          opacity: 0.75;
          height: 40px;
          overflow: hidden;
        }

        .cardFooter {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }

        .price {
          font-size: 18px;
          font-weight: 700;
        }

        .oldPrice {
          font-size: 14px;
          opacity: 0.5;
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
