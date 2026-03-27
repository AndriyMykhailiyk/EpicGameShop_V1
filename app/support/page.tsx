import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Центр підтримки — Epic Games Store",
  description:
    "Часті запитання щодо замовлень, оплати, облікового запису та повернень. Контакти служби підтримки Epic Games Store.",
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
  faqItem: {
    marginBottom: "clamp(1.25rem, 3vw, 1.75rem)",
    paddingBottom: "clamp(1rem, 2.5vw, 1.25rem)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  },
  h3: {
    fontSize: "clamp(1.0625rem, 3vw, 1.1875rem)",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#e2e8f0",
  },
  p: {
    fontSize: "clamp(0.9375rem, 2.5vw, 1rem)",
    color: "#94a3b8",
    lineHeight: 1.7,
    margin: 0,
  },
  contactBox: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: "12px",
    padding: "clamp(1rem, 3vw, 1.5rem)",
    marginBottom: "clamp(1.25rem, 3vw, 1.75rem)",
  },
  storeLink: {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: "44px",
    padding: "0 1.25rem",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontSize: "clamp(0.9375rem, 2.5vw, 1rem)",
    fontWeight: 600,
    textDecoration: "none" as const,
    borderRadius: "8px",
    marginTop: "0.5rem",
  },
};

export default function SupportPage() {
  return (
    <div style={pageStyles.outer}>
      <div style={pageStyles.container}>
        <Link href="/" style={pageStyles.backLink}>
          ← На головну
        </Link>

        <article>
          <h1 style={pageStyles.h1}>Центр підтримки</h1>
          <p style={pageStyles.lead}>
            Тут зібрані відповіді на типові питання про замовлення, оплату та обліковий запис. Якщо
            потрібна індивідуальна допомога — скористайтеся контактами нижче.
          </p>

          <section style={pageStyles.section} aria-labelledby="faq-heading">
            <h2 id="faq-heading" style={pageStyles.h2}>
              Часті запитання
            </h2>

            <div style={pageStyles.faqItem}>
              <h3 style={pageStyles.h3}>Як дізнатися статус замовлення?</h3>
              <p style={pageStyles.p}>
                Увійдіть в обліковий запис і відкрийте розділ «Мої замовлення». Там відображаються
                етапи оплати та наявність ключа або посилання на бібліотеку після успішної покупки
                цифрового товару.
              </p>
            </div>

            <div style={pageStyles.faqItem}>
              <h3 style={pageStyles.h3}>Які способи оплати підтримуються?</h3>
              <p style={pageStyles.p}>
                Зазвичай доступні банківські картки Visa та Mastercard, а також локальні методи
                залежно від регіону. Під час оформлення покупки система покаже актуальний перелік для
                вашої країни та валюти.
              </p>
            </div>

            <div style={pageStyles.faqItem}>
              <h3 style={pageStyles.h3}>Не проходить оплата — що робити?</h3>
              <p style={pageStyles.p}>
                Перевірте достатність коштів, коректність даних картки та ліміти банку. Спробуйте
                інший спосіб оплати або зверніться до банку щодо блокування онлайн-платежів. Якщо
                кошти списалися, але гра не з’явилася в бібліотеці, надішліть звернення з номером
                транзакції.
              </p>
            </div>

            <div style={pageStyles.faqItem}>
              <h3 style={pageStyles.h3}>Як відновити доступ до облікового запису?</h3>
              <p style={pageStyles.p}>
                Скористайтеся функцією відновлення пароля на сторінці входу. Якщо немає доступу до
                пошти або підозра на злом акаунту, зверніться до підтримки з підтвердженням
                володіння обліковим записом (історія покупок, реквізити картки тощо — згідно з
                інструкціями оператора).
              </p>
            </div>

            <div style={pageStyles.faqItem}>
              <h3 style={pageStyles.h3}>Чи можна повернути гроші за гру?</h3>
              <p style={pageStyles.p}>
                Умови повернення залежать від типу продукту, часу з моменту покупки та політики
                видавця. Ознайомтеся з розділом «Покупки та повернення» в{" "}
                <Link href="/terms" style={{ color: "#3b82f6", minHeight: "44px", display: "inline" }}>
                  умовах використання
                </Link>{" "}
                або подайте запит через форму підтримки з номером замовлення.
              </p>
            </div>

            <div style={{ ...pageStyles.faqItem, borderBottom: "none", paddingBottom: 0 }}>
              <h3 style={pageStyles.h3}>Де знайти куплені ігри?</h3>
              <p style={pageStyles.p}>
                Після покупки цифровий продукт з’являється в бібліотеці облікового запису Epic Games
                Store. Звідти можна встановити клієнт (за потреби) та керувати оновленнями.
              </p>
            </div>
          </section>

          <section style={pageStyles.section} aria-labelledby="contact-heading">
            <h2 id="contact-heading" style={pageStyles.h2}>
              Як з нами зв’язатися
            </h2>
            <div style={pageStyles.contactBox}>
              <p style={{ ...pageStyles.p, marginBottom: "0.75rem" }}>
                <strong style={{ color: "#e2e8f0" }}>Електронна пошта:</strong>{" "}
                <a
                  href="mailto:support@epicgame.shop"
                  style={{
                    color: "#3b82f6",
                    minHeight: "44px",
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  support@epicgame.shop
                </a>
              </p>
              <p style={pageStyles.p}>
                <strong style={{ color: "#e2e8f0" }}>Години роботи підтримки:</strong> понеділок —
                п’ятниця, 09:00–18:00 (за київським часом). Вихідні та свята — лише екстрені звернення
                з черги; відповідь може надійти наступного робочого дня.
              </p>
            </div>

            <p style={{ ...pageStyles.p, marginBottom: "1rem" }}>
              Повернутися до каталогу та акцій можна в будь-який момент:
            </p>
            <Link href="/store" style={pageStyles.storeLink}>
              Перейти до магазину
            </Link>
          </section>
        </article>
      </div>
    </div>
  );
}
