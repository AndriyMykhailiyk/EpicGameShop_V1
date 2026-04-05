"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "recentlyViewedGames";
const MAX_ITEMS = 6;

export interface RecentlyViewedGame {
  id: string;
  title: string;
  imageUrl: string;
  originalPrice: string;
  discountedPrice: string;
  discount?: number;
}

/**
 * Tracks recently viewed games in localStorage.
 * Stores up to MAX_ITEMS entries, newest first.
 * Returns the list excluding the currently viewed game.
 *
 * @param currentGameId - The ID of the game being viewed right now
 * @param gameData - Data to save for the current game (pass once loaded)
 * @returns Array of recently viewed games (excluding current)
 */
export function useRecentlyViewed(
  currentGameId: string | undefined,
  gameData?: RecentlyViewedGame | null,
): RecentlyViewedGame[] {
  const [recentGames, setRecentGames] = useState<RecentlyViewedGame[]>([]);

  useEffect(() => {
    if (!currentGameId) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: RecentlyViewedGame[] = raw ? JSON.parse(raw) : [];

      const filtered = stored.filter((g) => g.id !== currentGameId);
      setRecentGames(filtered.slice(0, MAX_ITEMS));
    } catch {
      setRecentGames([]);
    }
  }, [currentGameId]);

  useEffect(() => {
    if (!gameData?.id) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: RecentlyViewedGame[] = raw ? JSON.parse(raw) : [];

      const withoutCurrent = stored.filter((g) => g.id !== gameData.id);

      const entry: RecentlyViewedGame = {
        id: gameData.id,
        title: gameData.title,
        imageUrl: gameData.imageUrl,
        originalPrice: gameData.originalPrice,
        discountedPrice: gameData.discountedPrice,
        discount: gameData.discount,
      };

      const updated = [entry, ...withoutCurrent].slice(0, MAX_ITEMS + 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage not available
    }
  }, [gameData?.id, gameData?.title, gameData?.imageUrl, gameData?.originalPrice, gameData?.discountedPrice, gameData?.discount]);

  return recentGames;
}
