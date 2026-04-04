"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  feedbackTypeLabels,
  feedbackTypes,
  type FeedbackType,
} from "@/lib/validation/feedbackSchema";
import styles from "./FeedbackWidget.module.css";

const HIDDEN_ROUTES = ["/account", "/checkout", "/admin"];

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [type, setType] = useState<FeedbackType | "">("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const shouldHide = HIDDEN_ROUTES.some((r) => pathname?.startsWith(r));

  const resetForm = useCallback(() => {
    setName("");
    setEmail("");
    setTelegram("");
    setType("");
    setMessage("");
    setError("");
    setFieldErrors({});
    setSent(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(resetForm, 300);
  }, [resetForm]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeModal]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          telegram: telegram || undefined,
          type,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details?.fieldErrors) {
          setFieldErrors(data.details.fieldErrors);
        }
        setError(data.error || "Помилка. Спробуйте ще раз.");
        setSubmitting(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Не вдалося надіслати. Перевірте з'єднання.");
    } finally {
      setSubmitting(false);
    }
  };

  if (shouldHide) return null;

  return (
    <>
      <button
        type="button"
        className={styles.floatingBtn}
        onClick={() => setIsOpen(true)}
        aria-label="Зворотний зв'язок"
        title="Зворотний зв'язок"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label="Форма зворотного зв'язку"
        >
          <div className={styles.modal} ref={modalRef}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={closeModal}
              aria-label="Закрити"
            >
              &times;
            </button>

            {sent ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon} aria-hidden="true">
                  &#10003;
                </span>
                <h3>Дякуємо за відгук!</h3>
                <p>Ваше повідомлення надіслано. Ми відповімо якнайшвидше.</p>
                <button
                  type="button"
                  className={styles.closeAfterSuccess}
                  onClick={closeModal}
                >
                  Закрити
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.modalTitle}>Зворотний зв&apos;язок</h2>
                <p className={styles.modalSubtitle}>
                  Повідомте про помилку, залиште пропозицію або задайте питання
                </p>

                {error && <div className={styles.errorMsg}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="fb-name" className={styles.label}>
                        Ім&apos;я *
                      </label>
                      <input
                        id="fb-name"
                        type="text"
                        className={styles.input}
                        placeholder="Ваше ім'я"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={submitting}
                      />
                      {fieldErrors.name && (
                        <p className={styles.fieldError}>{fieldErrors.name[0]}</p>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="fb-type" className={styles.label}>
                        Тип *
                      </label>
                      <select
                        id="fb-type"
                        className={styles.select}
                        value={type}
                        onChange={(e) => setType(e.target.value as FeedbackType)}
                        required
                        disabled={submitting}
                      >
                        <option value="" disabled>
                          Оберіть тип
                        </option>
                        {feedbackTypes.map((t) => (
                          <option key={t} value={t}>
                            {feedbackTypeLabels[t]}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.type && (
                        <p className={styles.fieldError}>{fieldErrors.type[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="fb-email" className={styles.label}>
                      Email *
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      className={styles.input}
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={submitting}
                    />
                    {fieldErrors.email && (
                      <p className={styles.fieldError}>{fieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="fb-telegram" className={styles.label}>
                      Telegram (необов&apos;язково)
                    </label>
                    <input
                      id="fb-telegram"
                      type="text"
                      className={styles.input}
                      placeholder="@username"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      disabled={submitting}
                    />
                    {fieldErrors.telegram && (
                      <p className={styles.fieldError}>
                        {fieldErrors.telegram[0]}
                      </p>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="fb-message" className={styles.label}>
                      Повідомлення *
                    </label>
                    <textarea
                      id="fb-message"
                      className={styles.textarea}
                      placeholder="Опишіть вашу проблему, пропозицію або питання..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      minLength={10}
                      disabled={submitting}
                    />
                    {fieldErrors.message && (
                      <p className={styles.fieldError}>
                        {fieldErrors.message[0]}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? "Надсилання..." : "Надіслати"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
