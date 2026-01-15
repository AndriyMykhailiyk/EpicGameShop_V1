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
  const [isLoading, setIsLoading] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("card");
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [orderNumber, setOrderNumber] = React.useState("");
  const [activationKeys, setActivationKeys] = React.useState<any[]>([]);
  const [email, setEmail] = React.useState("");
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  // Діагностика - виведемо в консоль що приходить
  React.useEffect(() => {
    console.log("Cart items:", items);
    items.forEach((item) => {
      console.log(`Item: ${item.title}`);
      console.log(
        `  - discountedPrice:`,
        item.discountedPrice,
        typeof item.discountedPrice
      );
      console.log(`  - price:`, item.price);
      console.log(`  - originalPrice:`, item.originalPrice);
    });
  }, [items]);

  // Функція для отримання правильної ціни з товару
  const getItemPrice = (item: any): number => {
    // Спробуємо різні варіанти, де може бути ціна
    const priceVariants = [
      item.discountedPrice,
      item.price?.current,
      item.price,
      item.originalPrice,
      item.currentPrice,
    ];

    for (const variant of priceVariants) {
      if (variant !== undefined && variant !== null) {
        // Якщо це число - повертаємо його
        if (typeof variant === "number") {
          return variant;
        }

        // Якщо це рядок - парсимо
        if (typeof variant === "string") {
          // Видаляємо всі символи крім цифр та коми/крапки
          let cleaned = variant.replace(/[^\d.,]/g, "");

          // Визначаємо формат: "1,199,25" або "1,199.25" або "1199.25"
          const commaCount = (cleaned.match(/,/g) || []).length;
          const dotCount = (cleaned.match(/\./g) || []).length;

          if (commaCount > 1) {
            // Формат: "1,199,25" - коми як розділювачі тисяч, остання як десяткова
            const lastCommaIndex = cleaned.lastIndexOf(",");
            cleaned =
              cleaned.substring(0, lastCommaIndex).replace(/,/g, "") +
              "." +
              cleaned.substring(lastCommaIndex + 1);
          } else if (commaCount === 1 && dotCount === 0) {
            // Формат: "1199,25" або "1,199"
            const parts = cleaned.split(",");
            if (parts[1] && parts[1].length <= 2) {
              // Це десяткова кома: "1199,25" -> "1199.25"
              cleaned = cleaned.replace(",", ".");
            } else {
              // Це розділювач тисяч: "1,199" -> "1199"
              cleaned = cleaned.replace(",", "");
            }
          } else if (dotCount > 1) {
            // Формат: "1.199.25" - крапки як розділювачі тисяч
            const lastDotIndex = cleaned.lastIndexOf(".");
            cleaned =
              cleaned.substring(0, lastDotIndex).replace(/\./g, "") +
              "." +
              cleaned.substring(lastDotIndex + 1);
          } else {
            // Стандартний формат - просто замінюємо кому на крапку
            cleaned = cleaned.replace(",", ".");
          }

          const parsed = parseFloat(cleaned);

          if (!isNaN(parsed) && parsed > 0) {
            return parsed;
          }
        }
      }
    }

    console.warn(`Could not parse price for item:`, item);
    return 0;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );
  const tax = +(subtotal * 0.2).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const generateOrderNumber = () =>
    "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  const generateGameKey = () =>
    "XXXX-XXXX-XXXX-".replace(/X/g, () =>
      Math.floor(Math.random() * 16)
        .toString(16)
        .toUpperCase()
    ) + Math.random().toString(36).substring(2, 6).toUpperCase();

  const sendEmailReceipt = async (orderData: any) => {
    setIsSendingEmail(true);

    try {
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Дякуємо за покупку!</h2>
          <p><strong>Номер замовлення:</strong> ${orderData.orderNumber}</p>
          <p><strong>Дата:</strong> ${new Date().toLocaleString()}</p>
          
          <h3>Куплені товари:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Гра</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Кількість</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Ціна</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items
                .map(
                  (item: any) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${
                    item.title
                  }</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${
                    item.quantity
                  }</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.price.toFixed(
                    2
                  )} грн</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <h3 style="margin-top: 20px;">Ключі активації:</h3>
          ${orderData.keys
            .map(
              (keyItem: any) => `
            <div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #007bff;">
              <p style="margin: 5px 0;"><strong>${keyItem.title}</strong></p>
              ${keyItem.keys
                .map(
                  (key: string) => `
                <p style="margin: 5px 0; font-family: monospace; background: white; padding: 5px; border: 1px solid #ddd;">
                  ${key}
                </p>
              `
                )
                .join("")}
            </div>
          `
            )
            .join("")}
          
          <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
            <p><strong>Підсумок:</strong></p>
            <p>Ціна: ${subtotal.toFixed(2)} грн</p>
            <p>ПДВ (20%): ${tax.toFixed(2)} грн</p>
            <p style="font-size: 18px; color: #007bff;"><strong>Всього: ${total.toFixed(
              2
            )} грн</strong></p>
          </div>
          
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Це автоматичний лист. Будь ласка, збережіть його для вашого обліку.
          </p>
        </div>
      `;

      const response = await fetch("/api/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `Замовлення ${orderData.orderNumber} - EpicGame Shop`,
          html: emailHTML,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      alert("✅ Чек успішно відправлено на email!");
    } catch (error) {
      console.error("Email send error:", error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!email || !email.includes("@")) {
      alert("⚠️ Будь ласка, введіть правильний email!");
      return;
    }

    setIsLoading(true);

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

      const mergedMap: Record<string, any> = {};
      existing.forEach((g: any) => {
        mergedMap[g.id] = g;
      });
      toAdd.forEach((g) => {
        mergedMap[g.id] = { ...(mergedMap[g.id] || {}), ...g };
      });

      const merged = Object.values(mergedMap);
      localStorage.setItem("purchasedGames", JSON.stringify(merged));

      const orderNo = generateOrderNumber();
      const keys = items.map((item) => ({
        title: item.title,
        gameId: item.id,
        keys: Array.from({ length: item.quantity }).map(() =>
          generateGameKey()
        ),
      }));

      const flatKeys = items.flatMap((item) =>
        Array.from({ length: item.quantity }).map(() => ({
          game_id: item.id,
          game_title: item.title,
          activation_key: generateGameKey(),
        }))
      );

      setOrderNumber(orderNo);
      setActivationKeys(flatKeys);

      const orderData = {
        orderNumber: orderNo,
        email: email,
        total: total,
        subtotal: subtotal,
        tax: tax,
        created_at: new Date().toISOString(),
        items: items.map((item, idx) => ({
          id: item.id,
          game_title: item.title,
          quantity: item.quantity,
          price: getItemPrice(item) * item.quantity,
          activation_key: flatKeys[idx]?.activation_key || generateGameKey(),
        })),
      };

      const savedOrders = localStorage.getItem("userOrders");
      const existingOrders = savedOrders ? JSON.parse(savedOrders) : [];
      existingOrders.push(orderData);
      localStorage.setItem("userOrders", JSON.stringify(existingOrders));

      setShowReceipt(true);
      setIsLoading(false);

      await sendEmailReceipt({
        orderNumber: orderNo,
        items: items.map((it) => ({
          title: it.title,
          quantity: it.quantity,
          price: getItemPrice(it) * it.quantity,
        })),
        keys: keys,
      });
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Сталася помилка при оформленні замовлення");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.formColumn}>
          <h2 className={styles.sectionTitle}>Оформлення замовлення</h2>

          <div className={styles.cardBox} style={{ marginBottom: "20px" }}>
            <div className={styles.formField}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Email для отримання ключів активації *
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <small
                style={{
                  color: "#666",
                  fontSize: "12px",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Ключі активації будуть відправлені на цей email
              </small>
            </div>
          </div>

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
          </div>

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
            </div>
          )}

          <div className={styles.helpText}>
            <p>
              Ви погоджуєтесь з умовами покупки. Натиснувши «Розмістити
              замовлення», ви підтверджуєте, що вам виповнилося 18 років.
            </p>
          </div>

          <div className={styles.actionsRow}>
            <button
              onClick={handlePlaceOrder}
              className={styles.placeButton}
              disabled={isLoading || isSendingEmail}
            >
              {isLoading || isSendingEmail
                ? "Обробка..."
                : "Розмістити замовлення"}
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
                    {(getItemPrice(it) * it.quantity).toFixed(2)} грн
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
        </aside>
      </div>

      {showReceipt && (
        <div className={styles.modalOverlay}>
          <div className={styles.receiptModal}>
            <div className={styles.receiptHeader}>
              <h2>Дякуємо за покупку!</h2>
              <button
                className={styles.closeModal}
                onClick={() => {
                  dispatch(clearCart());
                  setShowReceipt(false);
                  window.location.href = "/";
                }}
              >
                ✕
              </button>
            </div>

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
              <p style={{ color: "#28a745", marginTop: "10px" }}>
                ✅ Чек з ключами активації відправлено на ваш email!
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
                  <span>{it.title}</span>
                  {activationKeys
                    .filter((k) => k.game_id === it.id)
                    .map((k, idx) => (
                      <code key={idx}>{k.activation_key}</code>
                    ))}
                </div>
              ))}
            </div>

            <div className={styles.receiptTotal}>
              <span>Всього до сплати:</span>
              <strong>{total.toFixed(2)} грн</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
