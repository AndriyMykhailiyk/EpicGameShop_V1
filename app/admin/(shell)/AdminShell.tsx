"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import styles from "../admin.module.css";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/games", label: "Ігри" },
  { href: "/admin/users", label: "Користувачі" },
  { href: "/admin/orders", label: "Замовлення" },
  { href: "/admin/analytics", label: "Аналітика" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>EpicGame — Admin</div>
        {links.map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${
                active ? styles.navLinkActive : ""
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            style={{ width: "100%" }}
            onClick={async () => {
              try {
                await signOut({ redirect: false });
              } finally {
                window.location.assign("/");
              }
            }}
          >
            Вийти
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
