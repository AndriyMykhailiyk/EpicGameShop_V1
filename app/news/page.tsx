"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import styles from "./news.module.css";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
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
    content:
      "Щорічний літній розпродаж Epic Games Store офіційно стартував! Цього року ми підготували рекордні знижки — до 75% на тисячі ігор. Окрім того, кожен покупець отримає безкоштовний купон на 200 грн, який можна використати при покупці від 500 грн. Серед найпопулярніших пропозицій: Cyberpunk 2077 зі знижкою 60%, Red Dead Redemption 2 — 50%, та God of War Ragnarök — 40%. Розпродаж триватиме до 15 липня. Не пропустіть можливість поповнити свою бібліотеку найкращими іграми за вигідними цінами!",
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
    content:
      "Rockstar Games нарешті розкрили довгоочікувані деталі геймплею Grand Theft Auto VI. Гра повертає нас до Вайс-Сіті — міста, натхненного Маямі, з двома головними героями — Джейсоном та Лючією. Відкритий світ GTA VI стане найбільшим в історії серії, з динамічною погодою, живими NPC та безпрецедентним рівнем деталізації. Мультиплеєрний режим GTA Online 2 запуститься одночасно з основною грою. Реліз заплановано на осінь 2026 року для PlayStation 5, Xbox Series X|S та ПК.",
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
    content:
      "GSC Game World випустили масштабне оновлення 1.2 для S.T.A.L.K.E.R. 2: Heart of Chornobyl. Патч виправляє понад 300 багів, покращує FPS на 15-25% на всіх платформах та додає нові квести в Зоні. Серед ключових змін: повністю перероблена система A-Life 2.0 для більш реалістичної поведінки NPC, оптимізована система освітлення та нові текстури високої роздільної здатності. Також додано підтримку DLSS 4 та FSR 4. Оновлення доступне для завантаження вже зараз.",
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
    content:
      "Чудова новина для геймерів! Цього тижня CD Projekt RED та Epic Games дарують Cyberpunk 2077: Ultimate Edition абсолютно безкоштовно. Ця версія включає основну гру та DLC Phantom Liberty. Cyberpunk 2077 — це відкритий світ у футуристичному місті Найт-Сіті з глибоким сюжетом, кастомізацією персонажа та захоплюючими перестрілками. Після численних оновлень гра досягла відмінного стану. Встигніть забрати до 27 березня включно — гра залишиться у вашій бібліотеці назавжди!",
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
    content:
      "Фанати Hollow Knight можуть святкувати! Team Cherry нарешті оголосили офіційну дату виходу Hollow Knight: Silksong — 12 червня 2026 року. На презентації було показано 10-хвилинний ексклюзивний трейлер з п'ятьма новими босами, включаючи загадкового Золотого Ткача. Гра обіцяє більше 150 нових ворогів, понад 40 годин геймплею та повністю нову систему крафту. Silksong вийде одночасно на PC, Nintendo Switch та PlayStation 5. Попередні замовлення вже доступні з бонусним саундтреком.",
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
    content:
      "Epic Games Store представляє повністю перероблену систему досягнень! Тепер кожна гра підтримує трофеї з чотирма рівнями: бронзовий, срібний, золотий та платиновий. За збір досягнень ви отримуєте XP для вашого профілю та відкриваєте ексклюзивні бейджі. Топ-гравці кожного місяця отримають промокоди на знижки. Система також включає щоденні та щотижневі виклики з унікальними нагородами. Перші 100 ігор вже підтримують нову систему, а до кінця року їх кількість зросте до 500+.",
    imageUrl: "/images/games/fort.webp",
    category: "Платформа",
    date: "2026-03-10",
    readTime: "3 хв",
  },
];

const categories = [
  "Усі",
  "Акції",
  "Анонси",
  "Оновлення",
  "Безкоштовні ігри",
  "Платформа",
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("Усі");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    if (activeCategory === "Усі") return newsArticles;
    return newsArticles.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const featuredArticle = filteredArticles[0];
  const gridArticles = filteredArticles.slice(1);

  const toggleArticle = (id: string) => {
    setExpandedArticle((prev) => (prev === id ? null : id));
  };

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
          <button
            key={cat}
            type="button"
            className={`${styles.categoryChip} ${cat === activeCategory ? styles.categoryActive : ""}`}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={cat === activeCategory}
          >
            {cat}
          </button>
        ))}
      </nav>

      {filteredArticles.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Новин у цій категорії поки немає</p>
        </div>
      ) : (
        <>
          {featuredArticle && (
            <article className={styles.featured}>
              <div className={styles.featuredImage}>
                <Image
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className={styles.featuredImg}
                  priority
                />
                <span className={styles.featuredBadge}>
                  {featuredArticle.category}
                </span>
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.meta}>
                  <time dateTime={featuredArticle.date}>
                    {formatDate(featuredArticle.date)}
                  </time>
                  <span className={styles.dot}>·</span>
                  <span>{featuredArticle.readTime} читання</span>
                </div>
                <h2 className={styles.featuredTitle}>
                  {featuredArticle.title}
                </h2>
                <p className={styles.featuredExcerpt}>
                  {expandedArticle === featuredArticle.id
                    ? featuredArticle.content
                    : featuredArticle.excerpt}
                </p>
                <button
                  type="button"
                  className={styles.readMore}
                  onClick={() => toggleArticle(featuredArticle.id)}
                  aria-expanded={expandedArticle === featuredArticle.id}
                >
                  {expandedArticle === featuredArticle.id
                    ? "Згорнути ←"
                    : "Читати далі →"}
                </button>
              </div>
            </article>
          )}

          {gridArticles.length > 0 && (
            <div className={styles.grid}>
              {gridArticles.map((article) => (
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
                    <span className={styles.cardBadge}>
                      {article.category}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.meta}>
                      <time dateTime={article.date}>
                        {formatDate(article.date)}
                      </time>
                      <span className={styles.dot}>·</span>
                      <span>{article.readTime} читання</span>
                    </div>
                    <h3 className={styles.cardTitle}>{article.title}</h3>
                    <p className={styles.cardExcerpt}>
                      {expandedArticle === article.id
                        ? article.content
                        : article.excerpt}
                    </p>
                    <button
                      type="button"
                      className={styles.readMore}
                      onClick={() => toggleArticle(article.id)}
                      aria-expanded={expandedArticle === article.id}
                    >
                      {expandedArticle === article.id
                        ? "Згорнути ←"
                        : "Читати далі →"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
