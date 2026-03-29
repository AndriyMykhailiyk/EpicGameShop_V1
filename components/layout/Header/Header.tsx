"use client";

import { useState, useEffect } from "react";
import styles from "./HeaderCss/Header.module.css";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { saveUser, clearUser } from "@/lib/auth/userStore";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import SearchDropdown from "./SearchDropdown";
import ProfileMenu from "./ProfileMenu";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const cartItemsCount = useSelector((state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0),
  );

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

  return (
    <header className={styles.header}>
      {/* Desktop header */}
      <div className={styles.desktopMain}>
        <div className={styles.leftDiv}>
          <SearchDropdown />

          <div className={styles.Litext}>
            <ul className={styles.ulist}>
              <li>
                <Link href="/discover">Каталог</Link>
              </li>
              <li>
                <Link href="/discover?sort=newest">Новинки</Link>
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
                  sizes="28px"
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
                  sizes="28px"
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
            <ProfileMenu />
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className={styles.mobileMain}>
        <button
          className={styles.burgerBtn}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={sidebarOpen}
        >
          <span
            className={`${styles.burgerLine} ${sidebarOpen ? styles.burgerLineOpen1 : ""}`}
          />
          <span
            className={`${styles.burgerLine} ${sidebarOpen ? styles.burgerLineOpen2 : ""}`}
          />
          <span
            className={`${styles.burgerLine} ${sidebarOpen ? styles.burgerLineOpen3 : ""}`}
          />
        </button>

        <Link href="/" className={styles.mobileLogo}>
          EpicGame
        </Link>

        <div className={styles.mobileActions}>
          <button
            className={styles.mobileSearchBtn}
            onClick={() => setMobileSearchOpen((s) => !s)}
            aria-label="Пошук"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <Link
            href="/cart"
            aria-label="Кошик"
            className={styles.mobileCartBtn}
          >
            <Image
              src="/icons8.png"
              alt="Cart"
              width={24}
              height={24}
              sizes="24px"
            />
            {cartItemsCount > 0 && (
              <span className={styles.cartBadge}>{cartItemsCount}</span>
            )}
          </Link>

          <ProfileMenu />
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      {mobileSearchOpen && <SearchDropdown mobile />}
    </header>
  );
}
