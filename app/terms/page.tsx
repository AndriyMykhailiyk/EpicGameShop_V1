import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Умови використання — Epic Games Store",
  description:
    "Загальні умови користування Epic Games Store: обліковий запис, покупки, інтелектуальна власність та обмеження відповідальності.",
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
  h3: {
    fontSize: "clamp(1.0625rem, 3vw, 1.1875rem)",
    fontWeight: 600,
    marginTop: "1rem",
    marginBottom: "0.5rem",
    color: "#e2e8f0",
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

export default function TermsPage() {
  return (
    <div style={pageStyles.outer}>
      <div style={pageStyles.container}>
        <Link href="/" style={pageStyles.backLink}>
          ← На головну
        </Link>

        <article>
          <h1 style={pageStyles.h1}>Умови використання</h1>
          <p style={pageStyles.intro}>
            Цей документ регулює доступ до сервісів Epic Games Store та використання цифрового
            магазину. Ознайомлення з умовами перед реєстрацією та покупками допомагає уникнути
            непорозумінь і забезпечує прозорі правила для всіх сторін.
          </p>

          <section style={pageStyles.section} aria-labelledby="general-heading">
            <h2 id="general-heading" style={pageStyles.h2}>
              Загальні положення
            </h2>
            <p style={pageStyles.p}>
              Користуючись сайтом та сервісами магазину, ви підтверджуєте згоду з цими умовами та
              політикою конфіденційності. Якщо ви не погоджуєтеся з будь-яким пунктом, припиніть
              використання платформи. Epic Games Store залишає за собою право оновлювати документ;
              про суттєві зміни ми повідомляємо через інтерфейс сервісу або електронну пошту, коли це
              доцільно.
            </p>
            <p style={pageStyles.p}>
              Магазин призначений для особистого некомерційного використання контенту, якщо інше
              прямо не передбачено ліцензією на конкретну гру чи додаток.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="account-heading">
            <h2 id="account-heading" style={pageStyles.h2}>
              Обліковий запис
            </h2>
            <p style={pageStyles.p}>
              Ви зобов’язуєтеся надавати достовірні дані під час реєстрації та підтримувати їх
              актуальність. Обліковий запис є персональним; передача доступу третім особам може
              призвести до блокування та втрати контенту згідно з правилами безпеки.
            </p>
            <ul style={pageStyles.ul}>
              <li style={pageStyles.li}>Зберігайте пароль у безпеці та увімкніть двофакторну автентифікацію, якщо доступна</li>
              <li style={pageStyles.li}>
                Негайно повідомляйте підтримку про підозрілу активність на акаунті
              </li>
              <li style={pageStyles.li}>
                Заборонено використовувати сервіс для шахрайства, обходу регіональних обмежень у
                протиправний спосіб або поширення шкідливого ПЗ
              </li>
            </ul>
          </section>

          <section style={pageStyles.section} aria-labelledby="purchases-heading">
            <h2 id="purchases-heading" style={pageStyles.h2}>
              Покупки та повернення
            </h2>
            <p style={pageStyles.p}>
              Ціни відображаються у відповідній валюті з урахуванням податків, якщо це передбачено
              законодавством вашої країни. Оформлення замовлення означає згоду з вартістю та умовами
              ліцензії на цифровий продукт.
            </p>
            <h3 style={pageStyles.h3}>Повернення коштів</h3>
            <p style={pageStyles.p}>
              Умови повернення для цифрових товарів залежать від типу продукту, часу з моменту
              покупки та політики видавця. Детальні критерії та строки зазначені в розділі підтримки
              та на сторінці замовлення. У разі технічних збоїв оплати звертайтеся до служби
              підтримки з номером транзакції.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="ip-heading">
            <h2 id="ip-heading" style={pageStyles.h2}>
              Інтелектуальна власність
            </h2>
            <p style={pageStyles.p}>
              Усі торгові марки, логотипи, назви ігор та матеріали сайту належать відповідним
              правовласникам. Купівля гри надає вам особисту ліцензію на використання згідно з
              умовами видавця, а не право на перепродаж або публічний показ контенту поза межами,
              дозволеними ліцензією.
            </p>
            <p style={pageStyles.p}>
              Заборонено копіювати, модифікувати або розповсюджувати матеріали магазину без дозволу,
              окрім випадків, прямо дозволених законом.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="liability-heading">
            <h2 id="liability-heading" style={pageStyles.h2}>
              Обмеження відповідальності
            </h2>
            <p style={pageStyles.p}>
              Сервіс надається за принципом «як є». Ми докладаємо зусиль для стабільної роботи
              платформи, проте не гарантуємо безперебійний доступ через технічне обслуговування,
              оновлення або обставини поза нашим контролем.
            </p>
            <p style={pageStyles.p}>
              У межах, дозволених застосовним правом, відповідальність обмежується сумою, сплаченою
              за конкретний продукт у відповідний період, або відсутністю такої суми — у розумних
              межах, визначених законом.
            </p>
          </section>

          <section style={pageStyles.section} aria-labelledby="contact-heading">
            <h2 id="contact-heading" style={pageStyles.h2}>
              Контактна інформація
            </h2>
            <p style={pageStyles.p}>
              Питання щодо цих умов ви можете надіслати через форму у розділі{" "}
              <Link href="/support" style={pageStyles.contactLink}>
                Підтримка
              </Link>
              . Для юридичних звернень використовуйте офіційні канали, зазначені в підтвердженні
              замовлення або в обліковому записі.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
