"use client";

import React from "react";
import styles from "./checkout.module.css";
import type { CartItem } from "@/lib/store/cartSlice";
import type { FlatActivationKey } from "@/lib/checkout/orderUtils";
import { formatPrice } from "@/lib/checkout/priceUtils";

interface ReceiptModalProps {
  orderNumber: string;
  email: string;
  items: CartItem[];
  activationKeys: FlatActivationKey[];
  total: number;
  serverSaveMessage: string | null;
  onClose: () => void;
}

/**
 * Receipt modal shown after successful order placement.
 * Displays order details, activation keys, and a close button
 * that clears the cart and navigates to the homepage.
 */
export default function ReceiptModal({
  orderNumber,
  email,
  items,
  activationKeys,
  total,
  serverSaveMessage,
  onClose,
}: ReceiptModalProps) {
  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className={styles.receiptModal}>
        <div className={styles.receiptHeader}>
          <h2 id="receipt-title">Дякуємо за покупку!</h2>
          <button
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

        {serverSaveMessage && (
          <div className={styles.serverWarning} role="alert">
            {serverSaveMessage}
          </div>
        )}

        <div className={styles.receiptInfo}>
          <p>
            <strong>Номер замовлення:</strong> {orderNumber}
          </p>
          <p>
            <strong>Дата:</strong> {new Date().toLocaleString()}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p className={styles.receiptEmailSent}>
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
            Чек з ключами активації відправлено на ваш email!
          </p>
        </div>

        <div className={styles.receiptItems}>
          {items.map((it, index) => (
            <div key={it.id} className={styles.receiptItem}>
              <span>
                {index + 1}. {it.title}
              </span>
              <span>{it.quantity} шт.</span>
            </div>
          ))}
        </div>

        <div className={styles.keysSection}>
          <h3>Ключі активації</h3>
          {items.map((it) => (
            <div key={it.id} className={styles.keyRow}>
              <span className={styles.keyGameTitle}>{it.title}</span>
              <div className={styles.keysList}>
                {activationKeys
                  .filter((k) => k.game_id === it.id)
                  .map((k, idx) => (
                    <code key={idx} className={styles.keyCode}>
                      {k.activation_key}
                    </code>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.receiptTotal}>
          <span>Всього до сплати:</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </div>
    </div>
  );
}
