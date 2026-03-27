"use client";

import React, { useState, useCallback } from "react";
import styles from "./checkout.module.css";
import {
  type CardType,
  detectCardType,
  formatCardNumber,
  formatExpiry,
  getCvvLength,
  CARD_LABELS,
} from "@/lib/checkout/cardUtils";
import {
  validateCardNumber,
  validateExpiry,
  validateCvv,
  validateCardholderName,
  type ValidationResult,
} from "@/lib/checkout/validation";

interface FieldState {
  value: string;
  touched: boolean;
  error: string | null;
}

const INITIAL_FIELD: FieldState = { value: "", touched: false, error: null };

export interface CardFormData {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
  cardType: CardType;
}

interface CardPaymentFormProps {
  disabled?: boolean;
  onChange: (data: CardFormData, isValid: boolean) => void;
}

/**
 * Card payment form with real-time formatting and validation.
 * Detects card type from first digits and adjusts validation rules.
 */
export default function CardPaymentForm({
  disabled = false,
  onChange,
}: CardPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState<FieldState>(INITIAL_FIELD);
  const [cardExpiry, setCardExpiry] = useState<FieldState>(INITIAL_FIELD);
  const [cardCvv, setCardCvv] = useState<FieldState>(INITIAL_FIELD);
  const [cardName, setCardName] = useState<FieldState>(INITIAL_FIELD);
  const [cardType, setCardType] = useState<CardType>("unknown");
  const [showCvvTooltip, setShowCvvTooltip] = useState(false);

  const notifyParent = useCallback(
    (
      fields: {
        number?: FieldState;
        expiry?: FieldState;
        cvv?: FieldState;
        name?: FieldState;
      },
      type?: CardType,
    ) => {
      const n = fields.number ?? cardNumber;
      const e = fields.expiry ?? cardExpiry;
      const c = fields.cvv ?? cardCvv;
      const nm = fields.name ?? cardName;
      const ct = type ?? cardType;

      const maxDigits = ct === "amex" ? 15 : 16;
      const allValid =
        validateCardNumber(n.value, maxDigits).isValid &&
        validateExpiry(e.value).isValid &&
        validateCvv(c.value, ct).isValid &&
        validateCardholderName(nm.value).isValid;

      onChange(
        {
          cardNumber: n.value,
          cardExpiry: e.value,
          cardCvv: c.value,
          cardName: nm.value,
          cardType: ct,
        },
        allValid,
      );
    },
    [cardNumber, cardExpiry, cardCvv, cardName, cardType, onChange],
  );

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const type = detectCardType(formatted);
    setCardType(type);
    const newField: FieldState = {
      value: formatted,
      touched: cardNumber.touched,
      error: cardNumber.touched
        ? validateCardNumber(formatted, type === "amex" ? 15 : 16).error
        : null,
    };
    setCardNumber(newField);
    notifyParent({ number: newField }, type);
  };

  const handleCardNumberBlur = () => {
    const maxDigits = cardType === "amex" ? 15 : 16;
    const result = validateCardNumber(cardNumber.value, maxDigits);
    const updated = { ...cardNumber, touched: true, error: result.error };
    setCardNumber(updated);
    notifyParent({ number: updated });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    const newField: FieldState = {
      value: formatted,
      touched: cardExpiry.touched,
      error: cardExpiry.touched ? validateExpiry(formatted).error : null,
    };
    setCardExpiry(newField);
    notifyParent({ expiry: newField });
  };

  const handleExpiryBlur = () => {
    const result = validateExpiry(cardExpiry.value);
    const updated = { ...cardExpiry, touched: true, error: result.error };
    setCardExpiry(updated);
    notifyParent({ expiry: updated });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxLen = getCvvLength(cardType);
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    const newField: FieldState = {
      value: digits,
      touched: cardCvv.touched,
      error: cardCvv.touched ? validateCvv(digits, cardType).error : null,
    };
    setCardCvv(newField);
    notifyParent({ cvv: newField });
  };

  const handleCvvBlur = () => {
    const result = validateCvv(cardCvv.value, cardType);
    const updated = { ...cardCvv, touched: true, error: result.error };
    setCardCvv(updated);
    notifyParent({ cvv: updated });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newField: FieldState = {
      value: val,
      touched: cardName.touched,
      error: cardName.touched ? validateCardholderName(val).error : null,
    };
    setCardName(newField);
    notifyParent({ name: newField });
  };

  const handleNameBlur = () => {
    const result = validateCardholderName(cardName.value);
    const updated = { ...cardName, touched: true, error: result.error };
    setCardName(updated);
    notifyParent({ name: updated });
  };

  const fieldClass = (field: FieldState) =>
    `${styles.input} ${field.touched && field.error ? styles.inputError : ""} ${
      field.touched && !field.error && field.value ? styles.inputValid : ""
    }`;

  return (
    <div className={styles.cardForm}>
      {/* Card Number */}
      <div className={styles.formField}>
        <label htmlFor="card-number" className={styles.label}>
          Номер картки
        </label>
        <div className={styles.cardNumberWrapper}>
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000 0000 0000 0000"
            value={cardNumber.value}
            onChange={handleCardNumberChange}
            onBlur={handleCardNumberBlur}
            disabled={disabled}
            className={fieldClass(cardNumber)}
            aria-required="true"
            aria-invalid={cardNumber.touched && !!cardNumber.error}
            aria-describedby={cardNumber.error ? "card-number-error" : undefined}
          />
          {cardType !== "unknown" && (
            <span className={styles.cardTypeIndicator} data-type={cardType}>
              {CARD_LABELS[cardType]}
            </span>
          )}
        </div>
        {cardNumber.touched && cardNumber.error && (
          <span id="card-number-error" className={styles.fieldError} role="alert">
            {cardNumber.error}
          </span>
        )}
      </div>

      {/* Cardholder Name */}
      <div className={styles.formField}>
        <label htmlFor="card-name" className={styles.label}>
          Ім&apos;я на картці
        </label>
        <input
          id="card-name"
          type="text"
          autoComplete="off"
          placeholder="IVAN PETRENKO"
          value={cardName.value}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          disabled={disabled}
          className={fieldClass(cardName)}
          aria-required="true"
          aria-invalid={cardName.touched && !!cardName.error}
          aria-describedby={cardName.error ? "card-name-error" : undefined}
        />
        <span className={styles.fieldHint}>
          Вкажіть ім&apos;я латиницею, як зазначено на картці
        </span>
        {cardName.touched && cardName.error && (
          <span id="card-name-error" className={styles.fieldError} role="alert">
            {cardName.error}
          </span>
        )}
      </div>

      {/* Expiry + CVV row */}
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label htmlFor="card-expiry" className={styles.label}>
            Термін дії
          </label>
          <input
            id="card-expiry"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/YY"
            maxLength={5}
            value={cardExpiry.value}
            onChange={handleExpiryChange}
            onBlur={handleExpiryBlur}
            disabled={disabled}
            className={fieldClass(cardExpiry)}
            aria-required="true"
            aria-invalid={cardExpiry.touched && !!cardExpiry.error}
            aria-describedby={
              cardExpiry.error ? "card-expiry-error" : undefined
            }
          />
          {cardExpiry.touched && cardExpiry.error && (
            <span
              id="card-expiry-error"
              className={styles.fieldError}
              role="alert"
            >
              {cardExpiry.error}
            </span>
          )}
        </div>

        <div className={styles.formField}>
          <label htmlFor="card-cvv" className={styles.label}>
            CVV/CVC
            <button
              type="button"
              className={styles.cvvTooltipTrigger}
              onClick={() => setShowCvvTooltip(!showCvvTooltip)}
              aria-label="Що таке CVV?"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </label>
          <input
            id="card-cvv"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            placeholder={cardType === "amex" ? "1234" : "123"}
            maxLength={getCvvLength(cardType)}
            value={cardCvv.value}
            onChange={handleCvvChange}
            onBlur={handleCvvBlur}
            disabled={disabled}
            className={fieldClass(cardCvv)}
            aria-required="true"
            aria-invalid={cardCvv.touched && !!cardCvv.error}
            aria-describedby="cvv-hint"
          />
          {showCvvTooltip && (
            <div className={styles.cvvTooltip} role="tooltip">
              {cardType === "amex"
                ? "4-значний код на передній стороні картки"
                : "3-значний код на зворотній стороні картки"}
            </div>
          )}
          {cardCvv.touched && cardCvv.error && (
            <span id="card-cvv-error" className={styles.fieldError} role="alert">
              {cardCvv.error}
            </span>
          )}
        </div>
      </div>

      <p id="cvv-hint" className={styles.securityNote}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        CVV/CVC код не зберігається. Усі дані передаються в зашифрованому вигляді.
      </p>
    </div>
  );
}
