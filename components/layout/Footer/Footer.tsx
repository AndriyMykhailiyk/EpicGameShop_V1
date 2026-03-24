import Link from "next/link";
import styles from "./FooterCss/Footer.module.css";

const storeLinks = [
  { href: "/store", label: "Головна" },
  { href: "/games", label: "Всі ігри" },
  { href: "/store/sales", label: "Розпродажі" },
  /* Окремої сторінки «безкоштовні» немає — ведемо в загальний каталог */
  { href: "/games", label: "Безкоштовні ігри" },
];

const helpLinks = [
  { href: "/support", label: "Підтримка" },
  { href: "/terms", label: "Умови використання" },
  { href: "/privacy", label: "Політика конфіденційності" },
];

const companyLinks = [
  { href: "/about", label: "Про нас" },
  { href: "/careers", label: "Кар'єра" },
  { href: "/news", label: "Новини" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Підвал сайту">
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <span className={styles.brandName}>EpicGame Shop</span>
            <p className={styles.tagline}>
              Відкривайте нові світи: знижки, бібліотека та зручна покупка ігор в
              одному місці.
            </p>
          </div>

          <nav aria-labelledby="footer-store-heading">
            <h2 id="footer-store-heading" className={styles.sectionTitle}>
              Магазин
            </h2>
            <ul className={styles.list}>
              {storeLinks.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link href={item.href} className={styles.link}>
                    <span className={styles.linkChevron} aria-hidden>
                      ›
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-help-heading">
            <h2 id="footer-help-heading" className={styles.sectionTitle}>
              Довідка
            </h2>
            <ul className={styles.list}>
              {helpLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    <span className={styles.linkChevron} aria-hidden>
                      ›
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company-heading">
            <h2 id="footer-company-heading" className={styles.sectionTitle}>
              Epic Games
            </h2>
            <ul className={styles.list}>
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.link}>
                    <span className={styles.linkChevron} aria-hidden>
                      ›
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.legal}>
            © <span className={styles.year}>{year}</span> Epic Games, Inc. Усі
            права захищені.
          </p>
          <p className={styles.legalMuted}>
            Epic Games Store, логотип Epic Games та інші торгові марки є
            власністю Epic Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
