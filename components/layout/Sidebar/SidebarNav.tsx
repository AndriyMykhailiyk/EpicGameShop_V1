"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./SidebarCss/SidebarNav.module.css";
import { sidebarNavItems } from "@/lib/data/sidebarNav";

function isNavActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }
  if (href === "/store") {
    return pathname === "/store" || pathname.startsWith("/store/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SidebarNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isSignedIn =
    status === "authenticated" && Boolean(session?.user);

  const visibleItems = useMemo(
    () =>
      sidebarNavItems.filter((item) => !item.requiresAuth || isSignedIn),
    [isSignedIn],
  );

  return (
    <nav className={styles.nav} aria-label="Розділи магазину">
      <Link href="/" className={styles.sidebarLogo} aria-label="На головну">
        <div className={styles.logoFrame}>
          <Image
            src="https://img.icons8.com/plasticine/100/epic-games.png"
            alt="Epic Games"
            width={52}
            height={52}
            sizes="52px"
            priority
          />
        </div>
      </Link>

      <ul className={styles.list}>
        {visibleItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.id} className={styles.listItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className={styles.icon} aria-hidden>
                  {item.icon}
                </span>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.activeDot} aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
