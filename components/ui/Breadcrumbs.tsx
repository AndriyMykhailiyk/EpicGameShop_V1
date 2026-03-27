"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const ROUTE_LABELS: Record<string, string> = {
  store: "Крамниця",
  discover: "Каталог",
  games: "Ігри",
  cart: "Кошик",
  checkout: "Оформлення",
  library: "Бібліотека",
  saved: "Збережені",
  orders: "Замовлення",
  news: "Новини",
  about: "Про нас",
  support: "Підтримка",
  terms: "Умови",
  privacy: "Конфіденційність",
  p: "",
  sales: "Розпродажі",
};

/**
 * Automatic breadcrumb navigation based on current pathname.
 * Can be overridden with explicit `items` prop.
 *
 * @example
 * <Breadcrumbs />
 * <Breadcrumbs items={[{ label: "Крамниця", href: "/store" }, { label: "GTA VI" }]} />
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  const crumbs: BreadcrumbItem[] = items ?? buildCrumbs(pathname);

  if (crumbs.length <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Навігаційний ланцюжок">
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={index} className={styles.item}>
              {index > 0 && (
                <span className={styles.separator} aria-hidden>
                  /
                </span>
              )}
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className={styles.link}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function buildCrumbs(pathname: string | null): BreadcrumbItem[] {
  if (!pathname) return [];

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: "Головна", href: "/" }];

  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = ROUTE_LABELS[segment] ?? decodeURIComponent(segment);
    if (label) {
      crumbs.push({ label, href: path });
    }
  }

  return crumbs;
}
