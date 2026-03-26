"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import GameImage from "@/components/ui/GameImage";
import Link from "next/link";
import type { Game } from "@/types/game";
import styles from "./discover.module.css";

type SortOption =
  | "popular"
  | "newest"
  | "price-low"
  | "price-high"
  | "discount"
  | "name-az"
  | "name-za";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Популярні" },
  { value: "newest", label: "Новинки" },
  { value: "price-low", label: "Ціна: зростання" },
  { value: "price-high", label: "Ціна: спадання" },
  { value: "discount", label: "Найбільша знижка" },
  { value: "name-az", label: "Назва: А-Я" },
  { value: "name-za", label: "Назва: Я-А" },
];

const PLATFORM_LABELS: Record<string, string> = {
  Windows: "🖥 Windows",
  PlayStation: "🎮 PlayStation",
  Xbox: "🟢 Xbox",
  "Nintendo Switch": "🔴 Nintendo",
  Mobile: "📱 Mobile",
};

/**
 * Parses price string like "1,189,30 грн." or "Безкоштовна" into a number.
 */
function parsePrice(raw: string | undefined): number {
  if (!raw) return 0;
  const lower = raw.toLowerCase();
  if (lower.includes("безкоштовн")) return 0;
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(/,/g, ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

type Props = { games: Game[] };

export default function DiscoverClient({ games }: Props) {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "popular"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set()
  );
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);
  const [showMegaSale, setShowMegaSale] = useState(false);
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const sortParam = searchParams.get("sort") as SortOption | null;
    if (sortParam && SORT_OPTIONS.some((o) => o.value === sortParam)) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  const allPlatforms = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => g.platforms?.forEach((p) => set.add(p)));
    return Array.from(set).sort();
  }, [games]);

  const allTags = useMemo(() => {
    const counter = new Map<string, number>();
    games.forEach((g) =>
      g.tags?.forEach((t) => counter.set(t, (counter.get(t) || 0) + 1))
    );
    return Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, [games]);

  const priceMax = useMemo(() => {
    let max = 0;
    games.forEach((g) => {
      const p = parsePrice(g.discountedPrice);
      if (p > max) max = p;
    });
    return Math.ceil(max / 100) * 100 || 5000;
  }, [games]);

  const togglePlatform = useCallback((platform: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSortBy("popular");
    setSelectedPlatforms(new Set());
    setSelectedTags(new Set());
    setMaxPrice(priceMax);
    setShowFreeOnly(false);
    setShowOnSale(false);
    setShowMegaSale(false);
    setShowEarlyAccess(false);
  }, [priceMax]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedPlatforms.size > 0 ||
    selectedTags.size > 0 ||
    maxPrice < priceMax ||
    showFreeOnly ||
    showOnSale ||
    showMegaSale ||
    showEarlyAccess;

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return games.filter((game) => {
      if (
        query &&
        !game.title.toLowerCase().includes(query) &&
        !game.description?.toLowerCase().includes(query) &&
        !game.developer?.toLowerCase().includes(query)
      ) {
        return false;
      }

      if (
        selectedPlatforms.size > 0 &&
        !game.platforms?.some((p) => selectedPlatforms.has(p))
      ) {
        return false;
      }

      if (
        selectedTags.size > 0 &&
        !game.tags?.some((t) => selectedTags.has(t))
      ) {
        return false;
      }

      const price = parsePrice(game.discountedPrice);
      if (price > maxPrice) return false;

      if (showFreeOnly && price > 0) return false;
      if (showOnSale && (!game.discount || game.discount <= 0)) return false;
      if (showMegaSale && !game.isMegaSale) return false;
      if (showEarlyAccess && !game.isEarlyAccess) return false;

      return true;
    });
  }, [
    games,
    search,
    selectedPlatforms,
    selectedTags,
    maxPrice,
    showFreeOnly,
    showOnSale,
    showMegaSale,
    showEarlyAccess,
  ]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case "price-low":
        return copy.sort(
          (a, b) =>
            parsePrice(a.discountedPrice) - parsePrice(b.discountedPrice)
        );
      case "price-high":
        return copy.sort(
          (a, b) =>
            parsePrice(b.discountedPrice) - parsePrice(a.discountedPrice)
        );
      case "discount":
        return copy.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      case "name-az":
        return copy.sort((a, b) => a.title.localeCompare(b.title, "uk"));
      case "name-za":
        return copy.sort((a, b) => b.title.localeCompare(a.title, "uk"));
      case "newest":
        return copy.reverse();
      default:
        return copy;
    }
  }, [filtered, sortBy]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Каталог ігор</h1>
        <p className={styles.subtitle}>
          Знаходьте, фільтруйте та обирайте ідеальну гру
        </p>
        <p className={styles.resultCount}>
          Знайдено: {sorted.length} з {games.length} ігор
        </p>
      </div>

      <button
        className={styles.mobileFilterBtn}
        onClick={() => setFiltersOpen((s) => !s)}
        aria-expanded={filtersOpen}
      >
        <svg className={styles.filterIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {filtersOpen ? "Сховати фільтри" : "Показати фільтри"}
        {hasActiveFilters && " ●"}
      </button>

      <div className={styles.layout}>
        {/* ─── Filter sidebar ─── */}
        <aside
          className={`${styles.filterSidebar} ${filtersOpen ? styles.open : ""}`}
        >
          <div className={styles.filterSection}>
            <h3 className={styles.filterLabel}>Пошук</h3>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Назва, розробник..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterLabel}>Сортування</h3>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterLabel}>Платформи</h3>
            <div className={styles.chipGroup}>
              {allPlatforms.map((platform) => (
                <button
                  key={platform}
                  className={`${styles.chip} ${selectedPlatforms.has(platform) ? styles.chipActive : ""}`}
                  onClick={() => togglePlatform(platform)}
                >
                  {PLATFORM_LABELS[platform] || platform}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterLabel}>Жанри та теги</h3>
            <div className={styles.chipGroup}>
              {allTags.slice(0, 20).map((tag) => (
                <button
                  key={tag}
                  className={`${styles.chip} ${selectedTags.has(tag) ? styles.chipActive : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterLabel}>
              Макс. ціна: {maxPrice >= priceMax ? "будь-яка" : `${maxPrice} грн`}
            </h3>
            <div className={styles.priceRange}>
              <input
                type="range"
                className={styles.rangeSlider}
                min={0}
                max={priceMax}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className={styles.rangeValue}>
                0 — {maxPrice >= priceMax ? "∞" : `${maxPrice}`} грн
              </div>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterLabel}>Статус</h3>
            <div className={styles.toggleGroup}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  className={styles.toggleCheckbox}
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                />
                Безкоштовні
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  className={styles.toggleCheckbox}
                  checked={showOnSale}
                  onChange={(e) => setShowOnSale(e.target.checked)}
                />
                Зі знижкою
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  className={styles.toggleCheckbox}
                  checked={showMegaSale}
                  onChange={(e) => setShowMegaSale(e.target.checked)}
                />
                МЕГА АКЦІЇ
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  className={styles.toggleCheckbox}
                  checked={showEarlyAccess}
                  onChange={(e) => setShowEarlyAccess(e.target.checked)}
                />
                Ранній доступ
              </label>
            </div>
          </div>

          {hasActiveFilters && (
            <button className={styles.clearBtn} onClick={clearFilters}>
              Скинути всі фільтри
            </button>
          )}
        </aside>

        {/* ─── Content ─── */}
        <section className={styles.content}>
          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className={styles.activeFilters}>
              {search.trim() && (
                <button
                  className={styles.activeTag}
                  onClick={() => setSearch("")}
                >
                  Пошук: «{search}»
                  <span className={styles.activeTagClose}>×</span>
                </button>
              )}
              {Array.from(selectedPlatforms).map((p) => (
                <button
                  key={p}
                  className={styles.activeTag}
                  onClick={() => togglePlatform(p)}
                >
                  {p}
                  <span className={styles.activeTagClose}>×</span>
                </button>
              ))}
              {Array.from(selectedTags).map((t) => (
                <button
                  key={t}
                  className={styles.activeTag}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                  <span className={styles.activeTagClose}>×</span>
                </button>
              ))}
              {maxPrice < priceMax && (
                <button
                  className={styles.activeTag}
                  onClick={() => setMaxPrice(priceMax)}
                >
                  До {maxPrice} грн
                  <span className={styles.activeTagClose}>×</span>
                </button>
              )}
              {showFreeOnly && (
                <button
                  className={styles.activeTag}
                  onClick={() => setShowFreeOnly(false)}
                >
                  Безкоштовні
                  <span className={styles.activeTagClose}>×</span>
                </button>
              )}
              {showOnSale && (
                <button
                  className={styles.activeTag}
                  onClick={() => setShowOnSale(false)}
                >
                  Зі знижкою
                  <span className={styles.activeTagClose}>×</span>
                </button>
              )}
              {showMegaSale && (
                <button
                  className={styles.activeTag}
                  onClick={() => setShowMegaSale(false)}
                >
                  МЕГА АКЦІЇ
                  <span className={styles.activeTagClose}>×</span>
                </button>
              )}
              {showEarlyAccess && (
                <button
                  className={styles.activeTag}
                  onClick={() => setShowEarlyAccess(false)}
                >
                  Ранній доступ
                  <span className={styles.activeTagClose}>×</span>
                </button>
              )}
            </div>
          )}

          {/* Desktop sort bar */}
          <div className={styles.sortBar}>
            <span className={styles.sortBarLabel}>
              {sorted.length} {pluralGames(sorted.length)}
            </span>
            <div className={styles.sortBarRight}>
              <span className={styles.sortBarLabel}>Сортувати:</span>
              <select
                className={styles.sortBarSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Game grid */}
          {sorted.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🎮</div>
              <h3 className={styles.emptyTitle}>Нічого не знайдено</h3>
              <p className={styles.emptyText}>
                Спробуйте змінити фільтри або пошуковий запит
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {sorted.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const price = parsePrice(game.discountedPrice);
  const isFree = price === 0;

  return (
    <article className={styles.card}>
      <Link href={`/store/p/${game.id}`} className={styles.cardLink}>
        <div className={styles.cardImageWrap}>
          <GameImage
            src={game.imageUrl}
            alt={game.title}
            fill
            sizes="(max-width: 420px) 100vw, (max-width: 860px) 50vw, (max-width: 1100px) 33vw, 25vw"
            className={styles.cardImage}
            loading="lazy"
          />
          <div className={styles.badgeWrap}>
            {game.isMegaSale && (
              <span className={`${styles.badge} ${styles.badgeMega}`}>
                MEGA SALE
              </span>
            )}
            {!game.isMegaSale && game.discount && game.discount > 0 && (
              <span className={`${styles.badge} ${styles.badgeDiscount}`}>
                -{game.discount}%
              </span>
            )}
            {isFree && (
              <span className={`${styles.badge} ${styles.badgeFree}`}>
                FREE
              </span>
            )}
            {game.isEarlyAccess && (
              <span className={`${styles.badge} ${styles.badgeEarly}`}>
                Early Access
              </span>
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{game.title}</h3>

          {game.developer && (
            <p className={styles.cardDeveloper}>{game.developer}</p>
          )}

          {game.tags && game.tags.length > 0 && (
            <div className={styles.cardTags}>
              {game.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className={styles.cardTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {game.platforms && game.platforms.length > 0 && (
            <div className={styles.cardPlatforms}>
              {game.platforms.slice(0, 3).map((p) => (
                <span key={p} className={styles.platformIcon}>
                  {platformShort(p)}
                </span>
              ))}
              {game.platforms.length > 3 && (
                <span className={styles.platformIcon}>
                  +{game.platforms.length - 3}
                </span>
              )}
            </div>
          )}

          <div className={styles.cardFooter}>
            {isFree ? (
              <span className={styles.freePrice}>Безкоштовна</span>
            ) : (
              <>
                {game.originalPrice &&
                  game.originalPrice !== game.discountedPrice && (
                    <span className={styles.originalPrice}>
                      {game.originalPrice}
                    </span>
                  )}
                <span className={styles.currentPrice}>
                  {game.discountedPrice}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

function platformShort(name: string): string {
  const map: Record<string, string> = {
    Windows: "PC",
    PlayStation: "PS",
    Xbox: "Xbox",
    "Nintendo Switch": "NSW",
    Mobile: "Mob",
  };
  return map[name] || name;
}

function pluralGames(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return "ігор";
  if (mod10 === 1) return "гра";
  if (mod10 >= 2 && mod10 <= 4) return "гри";
  return "ігор";
}
