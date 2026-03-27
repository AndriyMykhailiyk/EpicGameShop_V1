"use client";

import React, { useEffect, useRef } from "react";
import styles from "./checkout.module.css";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal displaying terms and conditions for digital purchases.
 * Traps focus and closes on Escape key press.
 */
export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className={styles.termsModal}>
        <div className={styles.termsHeader}>
          <h2 id="terms-title">Умови покупки цифрових товарів</h2>
          <button
            ref={closeButtonRef}
            className={styles.closeModal}
            onClick={onClose}
            aria-label="Закрити"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.termsContent}>
          <section>
            <h3>1. Предмет угоди</h3>
            <p>
              Ця угода регулює придбання цифрових товарів (ключів активації для
              відеоігор) через інтернет-магазин EpicGame Shop. Здійснюючи
              покупку, ви погоджуєтесь з усіма наведеними нижче умовами.
            </p>
          </section>

          <section>
            <h3>2. Цифрові товари</h3>
            <p>
              Усі товари, представлені в нашому магазині, є цифровими ключами
              активації. Після оплати ви отримаєте унікальний ключ активації на
              вказану електронну адресу та на сторінці підтвердження замовлення.
            </p>
          </section>

          <section>
            <h3>3. Повернення та обмін</h3>
            <p>
              Згідно із законодавством про захист прав споживачів, цифрові товари
              не підлягають поверненню після отримання ключа активації. Виключення
              становлять випадки, коли ключ виявився недійсним або не працює — у
              такому разі зверніться до нашої служби підтримки протягом 48 годин.
            </p>
          </section>

          <section>
            <h3>4. Вікові обмеження</h3>
            <p>
              Натискаючи кнопку &laquo;Розмістити замовлення&raquo;, ви
              підтверджуєте, що вам виповнилось 18 років або ви маєте згоду
              батьків чи законних представників.
            </p>
          </section>

          <section>
            <h3>5. Інтелектуальна власність</h3>
            <p>
              Придбання ключа активації надає вам ліцензію на використання
              відповідного програмного забезпечення відповідно до умов
              ліцензійної угоди видавця. Це не передає вам права власності на
              інтелектуальну власність.
            </p>
          </section>

          <section>
            <h3>6. Конфіденційність</h3>
            <p>
              Ваші персональні дані обробляються відповідно до нашої Політики
              конфіденційності та чинного законодавства про захист персональних
              даних (GDPR). Платіжні дані обробляються виключно захищеними
              платіжними провайдерами.
            </p>
          </section>

          <section>
            <h3>7. Відповідальність</h3>
            <p>
              EpicGame Shop не несе відповідальності за блокування або
              деактивацію ключів, спричинену порушенням користувачем умов
              використання відповідної платформи (Steam, Epic Games, тощо).
            </p>
          </section>
        </div>

        <div className={styles.termsFooter}>
          <button
            type="button"
            onClick={onClose}
            className={styles.termsCloseBtn}
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
}
