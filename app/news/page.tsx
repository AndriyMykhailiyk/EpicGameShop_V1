import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./news.module.css";

export const metadata: Metadata = {
  title: "Новини — Epic Games Store",
  description: "Останні новини, оновлення та анонси зі світу ігор",
};

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  date: string;
  readTime: string;
}

const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Літній розпродаж Epic Games Store 2026 — знижки до 75%",
    excerpt:
      "Щорічний розпродаж стартував! Тисячі ігор зі знижками, безкоштовні купони та ексклюзивні пропозиції. Не пропустіть найкращі угоди літа.",
    imageUrl: "/images/games/GTA_VI_Poster.jpg",
    category: "Акції",
    date: "2026-03-25",
    readTime: "3 хв",
  },
  {
    id: "2",
    title: "GTA VI — дата виходу та нові деталі геймплею",
    excerpt:
      "Rockstar Games нарешті розкрили деталі геймплею GTA VI. Повернення до Вайс-Сіті, два головних герої та найбільший відкритий світ в історії серії.",
    imageUrl: "/images/games/gta.png",
    category: "Анонси",
    date: "2026-03-20",
    readTime: "5 хв",
  },
  {
    id: "3",
    title: "S.T.A.L.K.E.R. 2 — патч 1.2 з покращеннями продуктивності",
    excerpt:
      "GSC Game World випустили масштабне оновлення для S.T.A.L.K.E.R. 2: Heart of Chornobyl. Виправлено понад 300 багів та значно покращено FPS.",
    imageUrl: "/images/games/stalker.png",
    category: "Оновлення",
    date: "2026-03-18",
    readTime: "4 хв",
  },
  {
    id: "4",
    title: "Безкоштовна гра тижня: Cyberpunk 2077 у Epic Games Store",
    excerpt:
      "Цього тижня CD Projekt RED та Epic Games дарують Cyberpunk 2077: Ultimate Edition. Забирайте безкоштовно до 27 березня включно.",
    imageUrl: "/images/games/cyberpunk.avif",
    category: "Безкоштовні ігри",
    date: "2026-03-15",
    readTime: "2 хв",
  },
  {
    id: "5",
    title: "Hollow Knight: Silksong — ексклюзивний трейлер та дата релізу",
    excerpt:
      "Довгоочікуване продовження культової метроїдванії нарешті має офіційну дату виходу. Team Cherry показали 10-хвилинний трейлер із новими босами.",
    imageUrl: "/images/games/silkson.avif",
    category: "Анонси",
    date: "2026-03-12",
    readTime: "4 хв",
  },
  {
    id: "6",
    title: "Нова система досягнень Epic Games Store",
    excerpt:
      "Ми запускаємо повністю перероблену систему досягнень з рівнями прогресу, профільними бейджами та нагородами за активність у магазині.",
    imageUrl: "/images/games/fort.webp",
    category: "Платформа",
    date: "2026-03-10",
    readTime: "3 хв",
  },
];

const categories = ["Усі", "Акції", "Анонси", "Оновлення", "Безкоштовні ігри", "Платформа"];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Новини</h1>
        <p className={styles.subtitle}>
          Останні оновлення, анонси та акції зі світу ігор
        </p>
      </header>

      <nav className={styles.categories} aria-label="Категорії новин">
        {categories.map((cat) => (
          <span
            key={cat}
            className={`${styles.categoryChip} ${cat === "Усі" ? styles.categoryActive : ""}`}
          >
            {cat}
          </span>
        ))}
      </nav>

      {/* Featured article */}
      <article className={styles.featured}>
        <div className={styles.featuredImage}>
          <Image
            src={newsArticles[0].imageUrl}
            alt={newsArticles[0].title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className={styles.featuredImg}
            priority
          />
          <span className={styles.featuredBadge}>{newsArticles[0].category}</span>
        </div>
        <div className={styles.featuredBody}>
          <div className={styles.meta}>
            <time dateTime={newsArticles[0].date}>
              {formatDate(newsArticles[0].date)}
            </time>
            <span className={styles.dot}>·</span>
            <span>{newsArticles[0].readTime} читання</span>
          </div>
          <h2 className={styles.featuredTitle}>{newsArticles[0].title}</h2>
          <p className={styles.featuredExcerpt}>{newsArticles[0].excerpt}</p>
          <Link href={`/news`} className={styles.readMore}>
            Читати далі →
          </Link>
        </div>
      </article>

      {/* Grid of articles */}
      <div className={styles.grid}>
        {newsArticles.slice(1).map((article) => (
          <article key={article.id} className={styles.card}>
            <div className={styles.cardImage}>
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={styles.cardImg}
                loading="lazy"
              />
              <span className={styles.cardBadge}>{article.category}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.meta}>
                <time dateTime={article.date}>{formatDate(article.date)}</time>
                <span className={styles.dot}>·</span>
                <span>{article.readTime} читання</span>
              </div>
              <h3 className={styles.cardTitle}>{article.title}</h3>
              <p className={styles.cardExcerpt}>{article.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
