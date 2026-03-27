import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Політика конфіденційності — Epic Games Store",
  description:
    "Які дані збирає Epic Games Store, як вони використовуються, файли cookie, треті сторони та ваші права.",
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
  intro: {
    fontSize: "clamp(0.9375rem, 2.5vw, 1rem)",
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
  contactLink: {
    color: "#3b82f6",
    minHeight: "44px",
    display: "inline-flex" as const,
    alignItems: "center" as const,
    textDecoration: "none" as const,
  },
};

export default function PrivacyPage() {
  return (
    <div style={pageStyles.outer}>
      <div style={pageStyles.container}>
        <Link href="/" style={pageStyles.backLink}>
          ← На головну
        </Link>

        <article>
          <h1 style={pageStyles.h1}>Політика конфіденційності</h1>
          <p style={pageStyles.intro}>
            Ми поважаємо вашу приватність. Ця політика пояснює, які персональні дані можуть
            оброблятися в контексті Epic Games Store, з якою метою та які у вас є права відповідно до
            застосовного законодавства, зокрема GDPR, де воно застосовне.
          </p>

          <section style={pageStyles.section} aria-labelledby="collected-heading">
            <h2 id="collected-heading" style={pageStyles.h2}>
              Які дані збираються
            </h2>
            <p style={pageStyles.p}>
              Залежно від того, як ви користуєтеся сервісом, ми можемо обробляти такі категорії
              даних:
            </p>
            <ul style={pageStyles.ul}>
              <li style={pageStyles.li}>
                Ідентифікаційні та контактні дані: електронна пошта, ім’я облікового запису
              </li>
              <li style={pageStyles.li}>
                Дані транзакцій: історія замовлень, спосіб оплати (без повного номера картки — його
                обробляє платіжний провайдер)
              </li>
              <li style={pageStyles.li}>
                Технічні дані: тип пристрою, мова інтерфейсу, журнали помилок для діагностики
              </li>
              <li style={pageStyles.li}>
                Дані використання: переглянуті розділи каталогу, додані до списку бажаного товари
                (якщо ви користуєтеся відповідними функціями)
              </li>
            </ul>
          </section>

          <section style={pageStyles.section} aria-labelledby="usage-heading">
            <h2 id="usage-heading" style={pageStyles.h2}>
              Як використовуються дані
            </h2>
            <p style={pageStyles.p}>
              Дані обробляються для надання та покращення сервісу: автентифікація, оформлення
              покупок, підтримка клієнтів, персоналізація рекомендацій (за наявності відповідної
              функції), захист від шахрайства та дотримання юридичних зобов’язань.
            </p>
            <p style={pageStyles.p}>
              Юридичні підстави можуть включати виконання договору, законний інтерес (безпека,
              аналітика в агрегованому вигляді) або згоду, коли ви її явно надаєте, наприклад для
              маркетингових розсилок.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="cookies-heading">
            <h2 id="cookies-heading" style={pageStyles.h2}>
              Файли cookie та подібні технології
            </h2>
            <p style={pageStyles.p}>
              Ми використовуємо cookie та аналогічні механізми для збереження сесії входу,
              запам’ятовування налаштувань (мова, регіон) та збору агрегованої статистики
              відвідувань. Ви можете керувати cookie в налаштуваннях браузера; часткова відмова може
              обмежити окремі функції сайту.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="third-heading">
            <h2 id="third-heading" style={pageStyles.h2}>
              Треті сторони
            </h2>
            <p style={pageStyles.p}>
              Платіжні операції можуть оброблятися сертифікованими провайдерами від імені магазину.
              Хмарні та аналітичні сервіси можуть отримувати обмежений набір даних відповідно до
              угод про обробку даних. Ми не продаємо ваші персональні дані третім особам для їх
              незалежного маркетингу без вашої згоди, якщо інше не вимагає закон.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="rights-heading">
            <h2 id="rights-heading" style={pageStyles.h2}>
              Права користувача
            </h2>
            <p style={pageStyles.p}>
              Ви можете мати право на доступ до копії своїх даних, виправлення неточностей,
              видалення в певних випадках, обмеження обробки, перенесення даних та заперечення проти
              обробки на підставі законного інтересу. Для реалізації прав звертайтеся через канали
              підтримки; ми відповімо у строки, передбачені законом.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="retention-heading">
            <h2 id="retention-heading" style={pageStyles.h2}>
              Зберігання даних
            </h2>
            <p style={pageStyles.p}>
              Ми зберігаємо дані лише стільки, скільки потрібно для цілей, зазначених у цій політиці,
              або довше, якщо це вимагає закон (наприклад, податковий облік). Після закінчення строку
              зберігання дані видаляються або анонімізуються.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="contact-heading">
            <h2 id="contact-heading" style={pageStyles.h2}>
              Контактна інформація
            </h2>
            <p style={pageStyles.p}>
              Запити щодо конфіденційності та реалізації прав надсилайте через{" "}
              <Link href="/support" style={pageStyles.contactLink}>
                Центр підтримки
              </Link>
              . У зверненні вкажіть тему «Конфіденційність» та електронну адресу облікового запису для
              верифікації.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
