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

          <div className={styles.cardBox}>
            <label className={styles.radioRow}>
              <input type="radio" name="pay" defaultChecked />
              <span>Кредитна або дебетова картка</span>
            </label>

            <div className={styles.formField}>
              <label>Номер картки</label>
              <input type="text" placeholder="0000 0000 0000 0000" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formFieldSmall}>
                <label>Термін дії</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              <div className={styles.formFieldSmall}>
                <label>CVV</label>
                <input type="text" placeholder="CVV" />
              </div>
            </div>

            <div className={styles.saveOption}>
              <span className={styles.muted}>
                Зберегти цей спосіб оплати для подальших придбань?
              </span>
              <div className={styles.yesno}>
                <label>
                  <input type="radio" name="save" /> Так
                </label>
                <label>
                  <input type="radio" name="save" defaultChecked /> Ні
                </label>
              </div>
            </div>
          </div>

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
