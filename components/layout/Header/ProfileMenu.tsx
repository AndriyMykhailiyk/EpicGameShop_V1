"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { clearUser } from "@/lib/auth/userStore";
import styles from "./HeaderCss/Header.module.css";

/**
 * Profile avatar button with dropdown (sign out, admin link).
 * Rendered for both desktop and mobile layouts.
 */
export default function ProfileMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } finally {
      clearUser();
      setIsOpen(false);
      window.location.assign("/");
    }
  };

  if (!session?.user) {
    return (
      <Link href="/account" className={styles.loginBtn}>
        Вхід
      </Link>
    );
  }

  const avatarLetter = session.user.email
    ? session.user.email.charAt(0).toUpperCase()
    : "U";

  return (
    <div className={styles.avatarWrapper} ref={menuRef}>
      <button
        className={styles.avatarButton}
        onClick={() => setIsOpen((s) => !s)}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {avatarLetter}
      </button>

      {isOpen && (
        <div className={styles.avatarDropdown}>
          {session.user.isAdmin && (
            <Link
              href="/admin"
              className={styles.dropdownItem}
              onClick={() => setIsOpen(false)}
            >
              Адмін-панель
            </Link>
          )}
          <button className={styles.dropdownItem} onClick={handleSignOut}>
            Вийти
          </button>
        </div>
      )}
    </div>
  );
}
