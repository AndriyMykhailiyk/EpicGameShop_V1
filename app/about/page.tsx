import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Про нас — Epic Games Store",
  description:
    "Місія Epic Games Store, цінності команди, історія та можливості цифрового магазину ігор.",
};

const pageStyles = {
  outer: {
    minHeight: "100vh" as const,
    backgroundColor: "#0d0f1f",
    color: "#fff",
    padding: "clamp(1rem, 4vw, 2rem)",
    paddingTop: "clamp(1.25rem, 5vw, 2.5rem)",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 clamp(0.5rem, 2vw, 1rem)",
  },
  backLink: {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    minHeight: "44px",
    padding: "0 0.5rem",
    marginBottom: "clamp(1.25rem, 3vw, 2rem)",
    color: "#3b82f6",
    fontSize: "clamp(0.9375rem, 2.5vw, 1rem)",
    textDecoration: "none" as const,
  },
  h1: {
    fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
    fontWeight: 700,
    marginBottom: "clamp(1rem, 3vw, 1.5rem)",
    lineHeight: 1.2,
  },
  lead: {
    fontSize: "clamp(1rem, 2.8vw, 1.125rem)",
    color: "#94a3b8",
    lineHeight: 1.65,
    marginBottom: "clamp(1.5rem, 4vw, 2rem)",
  },
  section: {
    marginBottom: "clamp(1.75rem, 4vw, 2.5rem)",
  },
  h2: {
    fontSize: "clamp(1.25rem, 3.5vw, 1.5rem)",
    fontWeight: 600,
    marginBottom: "clamp(0.75rem, 2vw, 1rem)",
    color: "#fff",
  },
  p: {
    fontSize: "clamp(0.9375rem, 2.5vw, 1rem)",
    color: "#94a3b8",
    lineHeight: 1.7,
    marginBottom: "0.875rem",
  },
  ul: {
    margin: "0 0 0 1.25rem",
    padding: 0,
    color: "#94a3b8",
    fontSize: "clamp(0.9375rem, 2.5vw, 1rem)",
    lineHeight: 1.75,
  },
  li: {
    marginBottom: "0.5rem",
  },
};

export default function AboutPage() {
  return (
    <div style={pageStyles.outer}>
      <div style={pageStyles.container}>
        <Link href="/" style={pageStyles.backLink}>
          ← На головну
        </Link>

        <article>
          <h1 style={pageStyles.h1}>Про нас</h1>
          <p style={pageStyles.lead}>
            Epic Games Store — це цифрова платформа, де гравці відкривають для себе нові світи,
            а розробники знаходять аудиторію для своїх проєктів. Ми поєднуємо зручність покупки,
            чесні знижки та сервіс, орієнтований на довгострокові відносини з громадою.
          </p>

          <section style={pageStyles.section} aria-labelledby="mission-heading">
            <h2 id="mission-heading" style={pageStyles.h2}>
              Наша місія
            </h2>
            <p style={pageStyles.p}>
              Ми прагнемо зробити якісні ігри доступними для якомога більшої кількості людей,
              підтримувати незалежних авторів і забезпечувати безпечне середовище для покупок та
              зберігання бібліотеки. Epic Games Store — це не лише каталог, а екосистема, де кожен
              крок від вибору гри до запуску залишається простим і зрозумілим.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="values-heading">
            <h2 id="values-heading" style={pageStyles.h2}>
              Цінності команди
            </h2>
            <p style={pageStyles.p}>
              Ми будуємо продукт на принципах прозорості, поваги до гравця та відповідальності перед
              партнерами-видавцями. Для нас важливі чесна комунікація щодо цін і умов, стабільність
              сервісу та постійне вдосконалення інтерфейсу з урахуванням вашого досвіду.
            </p>
            <ul style={pageStyles.ul}>
              <li style={pageStyles.li}>Орієнтація на гравця та зручність щоденного користування</li>
              <li style={pageStyles.li}>Підтримка різноманіття жанрів і форматів релізів</li>
              <li style={pageStyles.li}>Безпека облікових записів і прозорі правила повернень</li>
            </ul>
          </section>

          <section style={pageStyles.section} aria-labelledby="history-heading">
            <h2 id="history-heading" style={pageStyles.h2}>
              Коротка історія
            </h2>
            <p style={pageStyles.p}>
              Epic Games Store з’явився як відповідь на запит спільноти до альтернативи традиційним
              магазинам: з акцентом на регулярні безкоштовні роздачі, ексклюзивні пропозиції та
              інтеграцію з ігровими сервісами Epic. З роками ми розширили каталог, додали зручні
              інструменти бібліотеки та персоналізовані рекомендації, зберігаючи фокус на якості
              контенту та підтримці розробників.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="features-heading">
            <h2 id="features-heading" style={pageStyles.h2}>
              Можливості магазину
            </h2>
            <ul style={pageStyles.ul}>
              <li style={pageStyles.li}>
                Єдина бібліотека покупок з швидким доступом до встановлення та оновлень
              </li>
              <li style={pageStyles.li}>
                Розділи знижок, добірок за жанрами та персональні підбірки на основі інтересів
              </li>
              <li style={pageStyles.li}>
                Захищені платежі та зрозумілі умови повернення для відповідних замовлень
              </li>
              <li style={pageStyles.li}>
                Синхронізація з обліковим записом Epic для збереження прогресу та соціальних функцій
              </li>
              <li style={pageStyles.li}>
                Новини релізів і оновлень, щоб не пропустити важливі події в улюблених іграх
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
