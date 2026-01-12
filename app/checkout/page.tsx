"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import styles from "./page.module.css";
import { RootState } from "@/lib/store/store";
import { clearCart } from "@/lib/store/cartSlice";

export default function CheckoutPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);
  const [paymentMethod, setPaymentMethod] = React.useState("card");

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const parsePrice = (price: string) => {
    const digitsOnly = price.replace(/[^\d]/g, "");
    return Number(digitsOnly) / 100;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.discountedPrice),
    0
  );
  const tax = +(subtotal * 0.2).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const handlePlaceOrder = () => {
    // Зберегти придбані ігри в localStorage (purchasedGames)
    try {
      const raw = localStorage.getItem("purchasedGames") || "[]";
      const existing = JSON.parse(raw);
      const now = new Date().toISOString();

      const toAdd = items.map((it: any) => ({
        id: it.id,
        title: it.title,
        image: it.imageUrl || it.image || "",
        developer: it.developer || undefined,
        publisher: it.publisher || undefined,
        genres: it.genres || [],
        platforms: it.platforms || [],
        purchasedAt: now,
      }));

      // merge without duplicates (by id) — prefer newest purchasedAt
      const mergedMap: Record<string, any> = {};
      (existing || []).forEach((g: any) => {
        mergedMap[g.id] = g;
      });
      toAdd.forEach((g) => {
        mergedMap[g.id] = { ...(mergedMap[g.id] || {}), ...g };
      });

      const merged = Object.values(mergedMap);
      localStorage.setItem("purchasedGames", JSON.stringify(merged));
    } catch (e) {
      console.error("Failed to save purchasedGames:", e);
    }

    // Очистити кошик і перейти в бібліотеку
    dispatch(clearCart());
    window.location.href = "/library";
  };

  if (isLoading) {
    return (
      <div className={styles.loaderOverlay}>
        <div className={styles.loaderRing} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.formColumn}>
          <h2 className={styles.sectionTitle}>Оформлення замовлення</h2>

          {/* Способи оплати */}
          <div className={styles.paymentMethods}>
            <div className={styles.methodsTitle}>Виберіть спосіб оплати</div>

            <label className={styles.methodOption}>
              <input
                type="radio"
                name="payment_method"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className={styles.methodContent}>
                <span className={styles.methodIcon}>💳</span>
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitle}>
                    Кредитна або дебетова картка
                  </div>
                  <div className={styles.methodDesc}>
                    Visa, Mastercard, Maestro
                  </div>
                </div>
              </div>
            </label>

            <label className={styles.methodOption}>
              <input
                type="radio"
                name="payment_method"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className={styles.methodContent}>
                <span className={styles.methodIcon}>🅿️</span>
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitle}>PayPal</div>
                  <div className={styles.methodDesc}>
                    Безпечна оплата через PayPal
                  </div>
                </div>
              </div>
            </label>

            <label className={styles.methodOption}>
              <input
                type="radio"
                name="payment_method"
                value="apple"
                checked={paymentMethod === "apple"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className={styles.methodContent}>
                <span className={styles.methodIcon}>🍎</span>
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitle}>Apple Pay</div>
                  <div className={styles.methodDesc}>
                    Швидкий платіж через Apple Pay
                  </div>
                </div>
              </div>
            </label>

            <label className={styles.methodOption}>
              <input
                type="radio"
                name="payment_method"
                value="google"
                checked={paymentMethod === "google"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className={styles.methodContent}>
                <span className={styles.methodIcon}>🔵</span>
                <div className={styles.methodInfo}>
                  <div className={styles.methodTitle}>Google Pay</div>
                  <div className={styles.methodDesc}>
                    Швидкий платіж через Google Pay
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Форма для кредитної карти */}
          {paymentMethod === "card" && (
            <div className={styles.cardBox}>
              <div className={styles.formField}>
                <label>Номер картки</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
              </div>

              <div className={styles.formField}>
                <label>Ім'я на картці</label>
                <input type="text" placeholder="IVAN PETRENKO" />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formFieldSmall}>
                  <label>Термін дії</label>
                  <input type="text" placeholder="MM/YY" maxLength={5} />
                </div>
                <div className={styles.formFieldSmall}>
                  <label>CVV</label>
                  <input type="text" placeholder="123" maxLength={4} />
                </div>
              </div>

              <div className={styles.saveOption}>
                <label>
                  <input type="checkbox" />
                  <span>Зберегти цей спосіб оплати</span>
                </label>
              </div>
            </div>
          )}

          {/* Інші способи оплати */}
          {paymentMethod !== "card" && (
            <div className={styles.cardBox}>
              <div className={styles.otherPaymentInfo}>
                <p>
                  Натисніть "Розмістити замовлення" для переходу на платіжний
                  сервіс
                </p>
              </div>
            </div>
          )}

          <div className={styles.helpText}>
            <p>
              Ви погоджуєтесь з умовами покупки. Натиснувши «Розмістити
              замовлення», ви підтверджуєте, що вам виповнилося 18 років.
            </p>
          </div>

          <div className={styles.actionsRow}>
            <button onClick={handlePlaceOrder} className={styles.placeButton}>
              Розмістити замовлення
            </button>
            <Link href="/" className={styles.cancelLink}>
              Повернутися до магазину
            </Link>
          </div>
        </div>

        <aside className={styles.summaryColumn}>
          <h3 className={styles.summaryTitle}>ПІДСУМОК ЗАМОВЛЕННЯ</h3>

          <div className={styles.summaryItems}>
            {items.map((it) => (
              <div key={it.id} className={styles.summaryItem}>
                <Image
                  src={it.imageUrl}
                  alt={it.title}
                  width={60}
                  height={90}
                />
                <div className={styles.summaryItemInfo}>
                  <div className={styles.summaryItemTitle}>{it.title}</div>
                  <div className={styles.summaryItemPrice}>
                    {it.discountedPrice}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Ціна</span>
            <span>{subtotal.toFixed(2)} грн</span>
          </div>
          <div className={styles.summaryRow}>
            <span>ПДВ (20%)</span>
            <span>{tax.toFixed(2)} грн</span>
          </div>

          <div className={styles.summaryTotalRow}>
            <span>Всього</span>
            <span className={styles.summaryTotal}>{total.toFixed(2)} грн</span>
          </div>

          <div className={styles.smallNote}>
            <p>Платіжні дані: Кредитна або дебетова картка</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
