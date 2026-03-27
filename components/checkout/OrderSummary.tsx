"use client";

import React from "react";
import GameImage from "@/components/ui/GameImage";
import styles from "./checkout.module.css";
import type { CartItem } from "@/lib/store/cartSlice";
import { getItemPrice, formatPrice } from "@/lib/checkout/priceUtils";
import { useDispatch } from "react-redux";
import { increaseQuantity, decreaseQuantity } from "@/lib/store/cartSlice";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  promoDiscount: number;
}

/**
 * Order summary sidebar showing cart items, quantities, and price breakdown.
 * Allows quantity adjustment directly from the checkout page.
 */
export default function OrderSummary({
  items,
  subtotal,
  tax,
  total,
  promoDiscount,
}: OrderSummaryProps) {
  const dispatch = useDispatch();

  return (
    <aside className={styles.summaryColumn} aria-label="Підсумок замовлення">
      <h3 className={styles.summaryTitle}>Підсумок замовлення</h3>

      <div className={styles.summaryItems}>
        {items.map((item) => {
          const lineTotal = getItemPrice(item) * item.quantity;
          return (
            <div key={item.id} className={styles.summaryItem}>
              <div className={styles.summaryItemImage}>
                <GameImage
                  src={item.imageUrl}
                  alt={item.title}
                  width={56}
                  height={75}
                />
              </div>
              <div className={styles.summaryItemInfo}>
                <span className={styles.summaryItemTitle}>{item.title}</span>
                <div className={styles.summaryItemQuantity}>
                  <button
                    type="button"
                    onClick={() => dispatch(decreaseQuantity(item.id))}
                    className={styles.quantityBtn}
                    aria-label={`Зменшити кількість ${item.title}`}
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span aria-label="Кількість">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => dispatch(increaseQuantity(item.id))}
                    className={styles.quantityBtn}
                    aria-label={`Збільшити кількість ${item.title}`}
                  >
                    +
                  </button>
                </div>
                <span className={styles.summaryItemPrice}>
                  {formatPrice(lineTotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.summaryBreakdown}>
        <div className={styles.summaryRow}>
          <span>Ціна</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {promoDiscount > 0 && (
          <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
            <span>Знижка (промокод)</span>
            <span>−{formatPrice(promoDiscount)}</span>
          </div>
        )}

        <div className={styles.summaryRow}>
          <span>ПДВ (20%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <div className={styles.summaryTotalRow}>
          <span>Всього</span>
          <span className={styles.summaryTotalAmount}>
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </aside>
  );
}
