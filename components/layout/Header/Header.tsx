"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./HeaderCss/Header.module.css";
import { getSaleGames } from "@/lib/api/game";
import { Game } from "@/types/game";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { saveUser, clearUser } from "@/lib/auth/userStore";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export default function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Отримуємо кількість товарів у кошику з Redux
  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0)
  );

  // Save user data to local storage when session changes
  useEffect(() => {
    if (session?.user) {
      saveUser({
        id: session.user.id as string | undefined,
        name: session.user.name || undefined,
        email: session.user.email || undefined,
      });
    } else {
      clearUser();
    }
  }, [session]);

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
          setAllGames(data.games ?? []);
        }
      } catch {
        if (!cancelled) {
          setAllGames(getSaleGames());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Фільтруємо ігри при зміні пошукового запиту
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGames([]);
      setIsDropdownVisible(false);
      return;
    }

    const filtered = allGames.filter(
      (game) =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredGames(filtered.slice(0, 5)); // Показуємо тільки перші 5 результатів
    setIsDropdownVisible(filtered.length > 0);
  }, [searchQuery, allGames]);

  // Закриваємо випадаюче меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGameSelect = () => {
    setSearchQuery("");
    setIsDropdownVisible(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } finally {
      clearUser();
      setIsProfileOpen(false);
      /* Full navigation resets SessionProvider state so sidebar/header cannot stay “logged in”. */
      window.location.assign("/");
    }
  };

  const avatarLetter = session?.user?.email
    ? session.user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <header className={styles.header}>
      <main className={styles.main}>
        <div className={styles.leftDiv}>
          <div className={styles.Input} ref={searchRef}>
            <input
              type="text"
              placeholder="Шукати в магазині..."
              className={styles.input}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() =>
                searchQuery.trim() !== "" && setIsDropdownVisible(true)
              }
            />

            {/* Випадаюче меню з результатами пошуку */}
            {isDropdownVisible && filteredGames.length > 0 && (
              <div className={styles.dropdown}>
                <ul className={styles.dropdownList}>
                  {filteredGames.map((game) => (
                    <li key={game.id} className={styles.dropdownItem}>
                      <Link
                        href={`/store/p/${game.id}`}
                        className={styles.gameLink}
                        onClick={handleGameSelect}
                      >
                        <div className={styles.gameInfo}>
                          {game.image && (
                            <div className={styles.gameImage}>
                              <img
                                src={game.image}
                                alt={game.title}
                                width={40}
                                height={40}
                              />
                            </div>
                          )}
                          <div className={styles.gameDetails}>
                            <span className={styles.gameTitle}>
                              {game.title}
                            </span>
                            {game.price && (
                              <span className={styles.gamePrice}>
                                ${game.price.current}
                                {game.price.original && (
                                  <span className={styles.originalPrice}>
                                    ${game.price.original}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.Litext}>
            <ul className={styles.ulist}>
              <li>
                <a>Цікавинки</a>
              </li>
              <li>
                <a>Новинки</a>
              </li>
              <li>
                <Link href="/games">Увесь асортимент</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.rightDiv}>
          <div className={styles.wraprightDiv}>
            <div className={styles.iconWrapper}>
              <Link href="/saved" aria-label="Перейти до збережених">
                <Image
                  src="/save.png"
                  alt="Saved games"
                  width={28}
                  height={28}
                  className={styles.icon}
                />
              </Link>
              <span className={styles.iconTooltip}>Збережені ігри</span>
            </div>
            <div className={styles.iconWrapper}>
              <Link
                href="/cart"
                aria-label="Перейти до кошика"
                className={styles.cartIconWrapper}
              >
                <Image
                  src="/icons8.png"
                  alt="Cart"
                  width={28}
                  height={28}
                  className={styles.icon}
                />
                {cartItemsCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemsCount}</span>
                )}
              </Link>
              <span className={styles.iconTooltip}>Кошик</span>
            </div>
          </div>
          <div className={styles.userProfile}>
            <div className={styles.userProfile} ref={profileRef}>
              {session?.user ? (
                <div className={styles.avatarWrapper}>
                  <button
                    className={styles.avatarButton}
                    onClick={() => setIsProfileOpen((s) => !s)}
                    aria-label="User menu"
                  >
                    {avatarLetter}
                  </button>

                  {isProfileOpen && (
                    <div className={styles.avatarDropdown}>
                      {session.user.isAdmin && (
                        <Link
                          href="/admin"
                          className={styles.dropdownItem}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Адмін-панель
                        </Link>
                      )}
                      <button
                        className={styles.dropdownItem}
                        onClick={handleSignOut}
                      >
                        Вийти
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/account" className={styles.loginBtn}>
                  Вхід
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </header>
  );
}
