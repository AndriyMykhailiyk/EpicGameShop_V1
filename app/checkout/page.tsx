"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import styles from "./page.module.css";
import { RootState } from "@/lib/store/store";
import { clearCart } from "@/lib/store/cartSlice";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid"; // для UUID локально, якщо потрібно

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

  const parsePrice = (price: string) => {
    if (!price) return 0;
    const cleaned = price.replace(/[^\d.,]/g, "");
    const normalized = cleaned.replace(",", ".");
    const result = parseFloat(normalized);
    return isNaN(result) ? 0 : result;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.discountedPrice) * item.quantity,
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
      // Отримуємо сесію користувача
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const user = sessionData?.session?.user;

      if (!user) {
        alert("⚠️ Користувач не авторизований, будь ласка, увійдіть в акаунт");
        setIsLoading(false);
        return;
      }

      // Генеруємо номер замовлення та ключі
      const orderNo = generateOrderNumber();

      const flatKeys = items.flatMap((item) =>
        Array.from({ length: item.quantity }).map(() => ({
          game_id: item.id.toString(),
          game_title: item.title,
          activation_key: generateGameKey(),
          price: parsePrice(item.discountedPrice),
        }))
      );

      // 1️⃣ Створюємо замовлення
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNo,
          total: total,
          user_id: user.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2️⃣ Створюємо order_items
      const orderItems = flatKeys.map((k) => ({
        id: uuidv4(),
        order_id: order.id,
        game_id: k.game_id,
        game_title: k.game_title,
        price: k.price,
        activation_key: k.activation_key,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Зберігаємо ключі та номер замовлення для чеку
      setOrderNumber(orderNo);
      setActivationKeys(orderItems);
      setShowReceipt(true);

      // Відправка email
      await sendEmailReceipt({
        orderNumber: orderNo,
        items: items.map((it) => ({
          title: it.title,
          quantity: it.quantity,
          price: parsePrice(it.discountedPrice) * it.quantity,
        })),
        keys: orderItems.reduce((acc: any[], k) => {
          const found = acc.find((a) => a.title === k.game_title);
          if (found) {
            found.keys.push(k.activation_key);
          } else {
            acc.push({ title: k.game_title, keys: [k.activation_key] });
          }
          return acc;
        }, []),
      });

      dispatch(clearCart());
    } catch (error) {
      console.error("Помилка оформлення замовлення:", error);
      alert("❌ Сталася помилка при оформленні замовлення");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.formColumn}>
          <h2 className={styles.sectionTitle}>Оформлення замовлення</h2>

          {/* Email поле */}
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
                    {(parsePrice(it.discountedPrice) * it.quantity).toFixed(2)}{" "}
                    грн
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
