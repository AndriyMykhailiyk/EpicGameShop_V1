"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import GameImage from "@/components/ui/GameImage";
import styles from "./HeaderCss/Header.module.css";

interface SearchResult {
  id: string;
  title: string;
  imageUrl: string;
  discountedPrice: string;
  originalPrice: string;
  discount?: number;
}

interface SearchDropdownProps {
  mobile?: boolean;
}

/**
 * Autocomplete search dropdown that uses the lightweight `/api/games/search`
 * endpoint instead of loading the full catalog into memory.
 */
export default function SearchDropdown({ mobile }: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    abortRef.current?.abort();

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/games/search?q=${encodeURIComponent(searchQuery.trim())}`,
        { signal: controller.signal },
      );
      if (!res.ok) return;
      const data = await res.json();
      setResults(data.results ?? []);
      setIsOpen((data.results ?? []).length > 0);
    } catch {
      /* aborted or network — ignore */
    }
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => handleSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const dropdownClass = mobile ? styles.mobileDropdown : styles.dropdown;
  const inputClass = mobile ? styles.mobileSearchInput : styles.input;

  return (
    <div className={mobile ? styles.mobileSearchBar : styles.Input} ref={containerRef}>
      <input
        type="text"
        placeholder="Шукати в магазині..."
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
        autoFocus={mobile}
      />

      {isOpen && results.length > 0 && (
        <div className={dropdownClass}>
          <ul className={styles.dropdownList}>
            {results.map((game) => (
              <li key={game.id} className={styles.dropdownItem}>
                <Link
                  href={`/store/p/${game.id}`}
                  className={styles.gameLink}
                  onClick={handleSelect}
                >
                  <div className={styles.gameInfo}>
                    <div className={styles.gameImage}>
                      <GameImage
                        src={game.imageUrl}
                        alt={game.title}
                        width={40}
                        height={40}
                        sizes="40px"
                        loading="lazy"
                      />
                    </div>
                    <div className={styles.gameDetails}>
                      <span className={styles.gameTitle}>{game.title}</span>
                      <span className={styles.gamePrice}>
                        {game.discountedPrice}
                        {game.originalPrice &&
                          game.originalPrice !== game.discountedPrice && (
                            <span className={styles.originalPrice}>
                              {game.originalPrice}
                            </span>
                          )}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
