// components/layout/Footer.tsx
import styles from "./FooterCss/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="footer-container">
        <div className={styles.footerSections}>
          <div className="footer-section">
            <h4>Магазин</h4>
            <ul>
              <li>
                <a href="/store">Головна</a>
              </li>
              <li>
                <a href="/store/browse">Всі ігри</a>
              </li>
              <li>
                <a href="/store/sales">Розпродажі</a>
              </li>
              <li>
                <a href="/store/free">Безкоштовні ігри</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Довідка</h4>
            <ul>
              <li>
                <a href="/support">Підтримка</a>
              </li>
              <li>
                <a href="/terms">Умови використання</a>
              </li>
              <li>
                <a href="/privacy">Політика конфіденційності</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Epic Games</h4>
            <ul>
              <li>
                <a href="/about">Про нас</a>
              </li>
              <li>
                <a href="/careers">Кар'єра</a>
              </li>
              <li>
                <a href="/news">Новини</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Epic Games, Inc. Усі права захищені.
          </p>
          <p>
            Epic Games Store, логотип Epic Games та інші торгові марки є
            власністю Epic Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
