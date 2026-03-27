"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState } from "@/lib/store/store";
import { clearCart } from "@/lib/store/cartSlice";
import { getItemPrice, formatPrice } from "@/lib/checkout/priceUtils";
import { validateEmail } from "@/lib/checkout/validation";
import {
  generateOrderNumber,
  generateActivationKeys,
  mergePurchasedGames,
  saveOrderLocally,
  buildServerOrderPayload,
  type FlatActivationKey,
} from "@/lib/checkout/orderUtils";

import SecurityBadges from "@/components/checkout/SecurityBadges";
import CardPaymentForm, {
  type CardFormData,
} from "@/components/checkout/CardPaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import PromoCode from "@/components/checkout/PromoCode";
import ReceiptModal from "@/components/checkout/ReceiptModal";
import TermsModal from "@/components/checkout/TermsModal";

import styles from "./page.module.css";
import cStyles from "@/components/checkout/checkout.module.css";

type PaymentMethod = "card" | "paypal";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardFormValid, setCardFormValid] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [savePaymentData, setSavePaymentData] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [activationKeys, setActivationKeys] = useState<FlatActivationKey[]>([]);
  const [orderServerSaveMessage, setOrderServerSaveMessage] = useState<
    string | null
  >(null);

  /* ─── Price calculations ─── */
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0),
    [items],
  );

  const effectiveSubtotal = Math.max(0, subtotal - promoDiscount);
  const tax = +(effectiveSubtotal * 0.2).toFixed(2);
  const total = +(effectiveSubtotal + tax).toFixed(2);

  /* ─── Email validation ─── */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailTouched) {
      setEmailError(validateEmail(val).error);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email).error);
  };

  /* ─── Card form callback ─── */
  const handleCardFormChange = useCallback(
    (_data: CardFormData, isValid: boolean) => {
      setCardFormValid(isValid);
    },
    [],
  );

  /* ─── Promo code ─── */
  const handlePromoApply = useCallback(
    async (
      code: string,
    ): Promise<{ valid: boolean; discount: number; error?: string }> => {
      try {
        const res = await fetch("/api/checkout/validate-promo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const body = await res.json();

        if (!res.ok || !body.valid) {
          return { valid: false, discount: 0, error: body.error };
        }

        const disc =
          body.discountType === "percentage"
            ? (subtotal * body.discount) / 100
            : body.discount;

        setPromoCode(code);
        setPromoDiscount(Math.min(disc, subtotal));
        return { valid: true, discount: disc };
      } catch {
        return {
          valid: false,
          discount: 0,
          error: "Не вдалося перевірити промокод",
        };
      }
    },
    [subtotal],
  );

  const handlePromoRemove = useCallback(() => {
    setPromoCode(null);
    setPromoDiscount(0);
  }, []);

  /* ─── Form validity check ─── */
  const isFormValid = useMemo(() => {
    const emailOk = validateEmail(email).isValid;
    const paymentOk = paymentMethod === "paypal" || cardFormValid;
    return emailOk && paymentOk && termsAccepted && items.length > 0;
  }, [email, paymentMethod, cardFormValid, termsAccepted, items.length]);

  /* ─── Email receipt ─── */
  const sendEmailReceipt = async (orderData: {
    orderNumber: string;
    items: { title: string; quantity: number; price: number }[];
    keys: { title: string; keys: string[] }[];
  }) => {
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
                  (item) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.title}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.price.toFixed(2)} грн</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <h3 style="margin-top: 20px;">Ключі активації:</h3>
          ${orderData.keys
            .map(
              (keyItem) => `
            <div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #007bff;">
              <p style="margin: 5px 0;"><strong>${keyItem.title}</strong></p>
              ${keyItem.keys
                .map(
                  (key) => `
                <p style="margin: 5px 0; font-family: monospace; background: white; padding: 5px; border: 1px solid #ddd;">${key}</p>
              `,
                )
                .join("")}
            </div>
          `,
            )
            .join("")}
          <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
            <p><strong>Підсумок:</strong></p>
            <p>Ціна: ${subtotal.toFixed(2)} грн</p>
            <p>ПДВ (20%): ${tax.toFixed(2)} грн</p>
            <p style="font-size: 18px; color: #007bff;"><strong>Всього: ${total.toFixed(2)} грн</strong></p>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Це автоматичний лист. Будь ласка, збережіть його для вашого обліку.
          </p>
        </div>
      `;

      const response = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `Замовлення ${orderData.orderNumber} - EpicGame Shop`,
          html: emailHTML,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }
    } catch {
      /* email delivery is optional — silently skip */
    } finally {
      setIsSendingEmail(false);
    }
  };

  /* ─── Place order ─── */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);
    setOrderServerSaveMessage(null);

    try {
      mergePurchasedGames(items);

      const orderNo = generateOrderNumber();
      const { grouped, flat } = generateActivationKeys(items);

      setOrderNumber(orderNo);
      setActivationKeys(flat);

      const localOrder = {
        orderNumber: orderNo,
        email,
        total,
        subtotal: effectiveSubtotal,
        tax,
        created_at: new Date().toISOString(),
        items: items.map((item) => ({
          id: item.id,
          game_title: item.title,
          quantity: item.quantity,
          price: getItemPrice(item) * item.quantity,
          activation_key:
            flat.find((k) => k.game_id === item.id)?.activation_key || "",
        })),
      };
      saveOrderLocally(localOrder);

      try {
        const persistBody = buildServerOrderPayload({
          email,
          userId: session?.user?.id ?? null,
          orderNumber: orderNo,
          items,
          flatKeys: flat,
          subtotal: effectiveSubtotal,
          tax,
          total,
        });

        const persistRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(persistBody),
        });

        if (!persistRes.ok) {
          let detail = persistRes.statusText;
          try {
            const errBody = (await persistRes.json()) as { error?: string };
            if (errBody?.error) detail = errBody.error;
          } catch {
            /* ignore parse error */
          }
          setOrderServerSaveMessage(
            `Замовлення збережено лише на цьому пристрої. Сервер не прийняв запис (${detail}).`,
          );
        }
      } catch {
        setOrderServerSaveMessage(
          "Замовлення збережено лише на цьому пристрої: не вдалося зв'язатися з сервером.",
        );
      }

      setShowReceipt(true);
      setIsLoading(false);

      await sendEmailReceipt({
        orderNumber: orderNo,
        items: items.map((it) => ({
          title: it.title,
          quantity: it.quantity,
          price: getItemPrice(it) * it.quantity,
        })),
        keys: grouped,
      });
    } catch {
      setIsLoading(false);
    }
  };

  /* ─── Receipt close ─── */
  const handleReceiptClose = () => {
    dispatch(clearCart());
    setShowReceipt(false);
    window.location.href = "/";
  };

  /* ─── Empty cart ─── */
  if (items.length === 0 && !showReceipt) {
    return (
      <div className={styles.container}>
        <div className={cStyles.emptyState}>
          <svg
            className={cStyles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h2 className={cStyles.emptyTitle}>Ваш кошик порожній</h2>
          <p className={cStyles.emptyText}>
            Додайте ігри до кошика, щоб перейти до оформлення замовлення.
          </p>
          <Link href="/" className={cStyles.emptyLink}>
            Перейти до магазину
          </Link>
        </div>
      </div>
    );
  }

  const isSubmitting = isLoading || isSendingEmail;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* ─── LEFT: Checkout form ─── */}
        <div className={styles.formColumn}>
          <h2 className={styles.pageTitle}>Оформлення замовлення</h2>

          <SecurityBadges />

          <form
            onSubmit={handlePlaceOrder}
            noValidate
            className={styles.checkoutForm}
          >
            {/* Contact */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Контактні дані</legend>
              <div className={cStyles.formField}>
                <label htmlFor="checkout-email" className={cStyles.label}>
                  Email для отримання ключів активації
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="off"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  disabled={isSubmitting}
                  className={`${cStyles.input} ${emailTouched && emailError ? cStyles.inputError : ""} ${emailTouched && !emailError && email ? cStyles.inputValid : ""}`}
                  aria-required="true"
                  aria-invalid={emailTouched && !!emailError}
                  aria-describedby={
                    emailError ? "email-error" : "email-hint"
                  }
                />
                <span id="email-hint" className={cStyles.fieldHint}>
                  Ключі активації будуть відправлені на цей email
                </span>
                {emailTouched && emailError && (
                  <span
                    id="email-error"
                    className={cStyles.fieldError}
                    role="alert"
                  >
                    {emailError}
                  </span>
                )}
              </div>
            </fieldset>

            {/* Payment method */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Спосіб оплати</legend>
              <div className={cStyles.paymentMethods}>
                <label className={cStyles.methodOption}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    disabled={isSubmitting}
                  />
                  <div className={cStyles.methodContent}>
                    <span className={cStyles.methodIcon} aria-hidden="true">
                      💳
                    </span>
                    <div className={cStyles.methodInfo}>
                      <span className={cStyles.methodTitle}>
                        Кредитна або дебетова картка
                      </span>
                      <span className={cStyles.methodDesc}>
                        Visa, Mastercard, Maestro
                      </span>
                    </div>
                  </div>
                </label>

                <label className={cStyles.methodOption}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                    disabled={isSubmitting}
                  />
                  <div className={cStyles.methodContent}>
                    <span className={cStyles.methodIcon} aria-hidden="true">
                      🅿️
                    </span>
                    <div className={cStyles.methodInfo}>
                      <span className={cStyles.methodTitle}>PayPal</span>
                      <span className={cStyles.methodDesc}>
                        Безпечна оплата через PayPal
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </fieldset>

            {/* Payment details */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                {paymentMethod === "card" ? "Дані картки" : "PayPal"}
              </legend>

              {paymentMethod === "card" ? (
                <CardPaymentForm
                  disabled={isSubmitting}
                  onChange={handleCardFormChange}
                />
              ) : (
                <div className={cStyles.paypalSection}>
                  <button
                    type="button"
                    className={cStyles.paypalBtn}
                    disabled={isSubmitting}
                  >
                    Перейти до PayPal
                  </button>
                  <p className={cStyles.paypalHint}>
                    Ви будете перенаправлені на сайт PayPal для завершення
                    оплати
                  </p>
                </div>
              )}
            </fieldset>

            {/* Promo code (mobile — inside form) */}
            <div className={styles.promoMobile}>
              <PromoCode
                onApply={handlePromoApply}
                onRemove={handlePromoRemove}
                appliedCode={promoCode}
                discount={promoDiscount}
                disabled={isSubmitting}
              />
            </div>

            {/* Consent */}
            <div className={cStyles.consentSection}>
              <label className={cStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isSubmitting}
                  aria-required="true"
                />
                <span>
                  Я погоджуюсь з{" "}
                  <button
                    type="button"
                    className={cStyles.termsLink}
                    onClick={() => setShowTermsModal(true)}
                  >
                    умовами покупки
                  </button>
                </span>
              </label>

              {session?.user && (
                <label className={cStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={savePaymentData}
                    onChange={(e) => setSavePaymentData(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span>
                    Зберегти платіжні дані для наступних покупок
                  </span>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className={cStyles.actionsRow}>
              <button
                type="submit"
                className={cStyles.placeButton}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={cStyles.spinner} aria-hidden="true" />
                    Обробка...
                  </>
                ) : (
                  `Сплатити ${formatPrice(total)}`
                )}
              </button>

              <Link href="/" className={cStyles.cancelLink}>
                Повернутися до магазину
              </Link>
            </div>
          </form>
        </div>

        {/* ─── RIGHT: Order summary ─── */}
        <div className={styles.summaryWrapper}>
          <OrderSummary
            items={items}
            subtotal={subtotal}
            tax={tax}
            total={total}
            promoDiscount={promoDiscount}
          />

          <div className={styles.promoDesktop}>
            <PromoCode
              onApply={handlePromoApply}
              onRemove={handlePromoRemove}
              appliedCode={promoCode}
              discount={promoDiscount}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* ─── Loading overlay ─── */}
      {isLoading && (
        <div className={cStyles.loaderOverlay} aria-live="assertive">
          <div className={cStyles.loaderContent}>
            <div className={cStyles.loaderRing} />
            <span>Оформлюємо ваше замовлення...</span>
          </div>
        </div>
      )}

      {/* ─── Terms modal ─── */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* ─── Receipt modal ─── */}
      {showReceipt && (
        <ReceiptModal
          orderNumber={orderNumber}
          email={email}
          items={items}
          activationKeys={activationKeys}
          total={total}
          serverSaveMessage={orderServerSaveMessage}
          onClose={handleReceiptClose}
        />
      )}
    </div>
  );
}
