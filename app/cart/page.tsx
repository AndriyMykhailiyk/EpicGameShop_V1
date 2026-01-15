"use client";

import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import styles from "./page.module.css";
import { RootState } from "@/lib/store/store";
import {
  removeFromCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
} from "@/lib/store/cartSlice";

export default function CartPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  // ✅ Коректний парсер ціни
  const parsePrice = (price: string) => {
    const digitsOnly = price.replace(/[^\d]/g, "");
    return Number(digitsOnly) / 100;
  };

  // ✅ Коректна загальна сума
  const totalPrice = items.reduce((sum, item) => {
    return sum + parsePrice(item.discountedPrice) * item.quantity;
  }, 0);

  // ✅ Порожній кошик
  if (items.length === 0) {
    return (
      <>
        <h1 className={styles.title}>Мій Кошик</h1>
        <main className={styles.container}>
          <div className={styles.emptyState}>
            <h1 className={styles.emptyText}>Ваш кошик поки що порожній.</h1>
            <Link href="/" className={styles.button}>
              Перейти до магазину
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ✅ Кошик з товарами
  return (
    <>
      <h1 className={styles.title}>Мій Кошик</h1>

      <main className={styles.cartContainer}>
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={100}
                  height={150}
                  className={styles.image}
                />
              </div>

              <div className={styles.itemDetails}>
                <Link
                  href={`/store/p/${item.id}`}
                  className={styles.itemTitleLink}
                >
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                </Link>
                {item.description && (
                  <p className={styles.itemDescription}>{item.description}</p>
                )}

                <div className={styles.itemPrices}>
                  {item.originalPrice && (
                    <span className={styles.originalPrice}>
                      {item.originalPrice}
                    </span>
                  )}

                  <span className={styles.discountedPrice}>
                    {item.discountedPrice}
                  </span>

                  {item.discount && (
                    <span className={styles.discount}>-{item.discount}%</span>
                  )}
                </div>
              </div>
              <div className={styles.quantityControls}>
                <button onClick={() => dispatch(decreaseQuantity(item.id))}>
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => dispatch(increaseQuantity(item.id))}>
                  +
                </button>
              </div>
              <button
                onClick={() => dispatch(removeFromCart(item.id))}
                className={styles.removeButton}
              >
                ✕ Видалити
              </button>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Разом:</span>
            <span className={styles.summaryTotal}>
              {totalPrice.toFixed(2)} грн
            </span>
          </div>

          <Link href="/checkout" className={styles.checkoutButton}>
            Оформити покупку
          </Link>

          <button
            onClick={() => dispatch(clearCart())}
            className={styles.clearButton}
          >
            Очистити кошик
          </button>

          <Link href="/" className={styles.continueButton}>
            Продовжити покупки
          </Link>
        </div>
      </main>
    </>
  );
}
