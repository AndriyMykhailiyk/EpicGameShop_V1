"use client";

import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import styles from "./page.module.css";
import { RootState } from "@/lib/store/store";
import { removeFromCart, clearCart } from "@/lib/store/cartSlice";

export default function CartPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.discountedPrice.replace("$", "")) || 0;
    return sum + price;
  }, 0);

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
                <h3 className={styles.itemTitle}>{item.title}</h3>
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
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          <button className={styles.checkoutButton}>Оформити покупку</button>

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
