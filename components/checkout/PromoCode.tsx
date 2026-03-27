"use client";

import React, { useState } from "react";
import styles from "./checkout.module.css";

interface PromoCodeProps {
  onApply: (
    code: string,
  ) => Promise<{ valid: boolean; discount: number; error?: string }>;
  onRemove: () => void;
  appliedCode: string | null;
  discount: number;
  disabled?: boolean;
}

/**
 * Promo code input with "Apply" button.
 * Calls the onApply callback which can validate against an API.
 */
export default function PromoCode({
  onApply,
  onRemove,
  appliedCode,
  discount,
  disabled = false,
}: PromoCodeProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Введіть промокод");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onApply(trimmed);
      if (!result.valid) {
        setError(result.error || "Промокод не знайдено або він недійсний");
      }
    } catch {
      setError("Не вдалося перевірити промокод. Спробуйте пізніше");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  if (appliedCode) {
    return (
      <div className={styles.promoApplied}>
        <div className={styles.promoAppliedInfo}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>
            Промокод <strong>{appliedCode}</strong> застосовано (−
            {discount.toFixed(2)} грн)
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className={styles.promoRemoveBtn}
          aria-label="Видалити промокод"
          disabled={disabled}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className={styles.promoSection}>
      <label htmlFor="promo-code" className={styles.promoLabel}>
        Промокод
      </label>
      <div className={styles.promoInputRow}>
        <input
          id="promo-code"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Введіть промокод"
          disabled={disabled || isLoading}
          className={`${styles.promoInput} ${error ? styles.inputError : ""}`}
          aria-describedby={error ? "promo-error" : undefined}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={disabled || isLoading || !code.trim()}
          className={styles.promoApplyBtn}
        >
          {isLoading ? "..." : "Застосувати"}
        </button>
      </div>
      {error && (
        <span id="promo-error" className={styles.fieldError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
