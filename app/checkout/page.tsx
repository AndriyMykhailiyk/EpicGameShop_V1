"use client";

import React from "react";
import Link from "next/link";
import { useCheckoutForm } from "@/lib/checkout/useCheckoutForm";

import SecurityBadges from "@/components/checkout/SecurityBadges";
import CardPaymentForm from "@/components/checkout/CardPaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import PromoCode from "@/components/checkout/PromoCode";
import ReceiptModal from "@/components/checkout/ReceiptModal";
import TermsModal from "@/components/checkout/TermsModal";
import LiqPayCheckout from "@/components/checkout/LiqPayCheckout";

import styles from "./page.module.css";
import cStyles from "@/components/checkout/checkout.module.css";

export default function CheckoutPage() {
  const form = useCheckoutForm();

  if (form.sessionStatus === "loading") {
    return (
      <div className={styles.container}>
        <div className={cStyles.emptyState}>
          <div className={cStyles.loaderRing} />
          <p className={cStyles.emptyText}>Завантаження...</p>
        </div>
      </div>
    );
  }

  if (form.sessionStatus === "unauthenticated" || !form.session) {
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h2 className={cStyles.emptyTitle}>Увійдіть в акаунт</h2>
          <p className={cStyles.emptyText}>
            Для оформлення замовлення потрібно авторизуватися.
          </p>
          <Link href="/account" className={cStyles.emptyLink}>
            Увійти в акаунт
          </Link>
        </div>
      </div>
    );
  }

  if (form.items.length === 0 && !form.showReceipt) {
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* ─── LEFT: Checkout form ─── */}
        <div className={styles.formColumn}>
          <h2 className={styles.pageTitle}>Оформлення замовлення</h2>

          <SecurityBadges />

          <form
            onSubmit={form.handlePlaceOrder}
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
                  value={form.email}
                  onChange={form.handleEmailChange}
                  onBlur={form.handleEmailBlur}
                  disabled={form.isSubmitting}
                  className={`${cStyles.input} ${form.emailTouched && form.emailError ? cStyles.inputError : ""} ${form.emailTouched && !form.emailError && form.email ? cStyles.inputValid : ""}`}
                  aria-required="true"
                  aria-invalid={form.emailTouched && !!form.emailError}
                  aria-describedby={
                    form.emailError ? "email-error" : "email-hint"
                  }
                />
                <span id="email-hint" className={cStyles.fieldHint}>
                  Ключі активації будуть відправлені на цей email
                </span>
                {form.emailTouched && form.emailError && (
                  <span
                    id="email-error"
                    className={cStyles.fieldError}
                    role="alert"
                  >
                    {form.emailError}
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
                    checked={form.paymentMethod === "card"}
                    onChange={() => form.setPaymentMethod("card")}
                    disabled={form.isSubmitting}
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
                    value="liqpay"
                    checked={form.paymentMethod === "liqpay"}
                    onChange={() => form.setPaymentMethod("liqpay")}
                    disabled={form.isSubmitting}
                  />
                  <div className={cStyles.methodContent}>
                    <span className={cStyles.methodIcon} aria-hidden="true">
                      🏦
                    </span>
                    <div className={cStyles.methodInfo}>
                      <span className={cStyles.methodTitle}>
                        ПриватБанк / LiqPay
                      </span>
                      <span className={cStyles.methodDesc}>
                        Оплата карткою через LiqPay (ПриватБанк)
                      </span>
                    </div>
                  </div>
                </label>

                <label className={cStyles.methodOption}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="paypal"
                    checked={form.paymentMethod === "paypal"}
                    onChange={() => form.setPaymentMethod("paypal")}
                    disabled={form.isSubmitting}
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
            {form.paymentMethod === "card" && (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>Дані картки</legend>
                <CardPaymentForm
                  disabled={form.isSubmitting}
                  onChange={form.handleCardFormChange}
                />
              </fieldset>
            )}

            {form.paymentMethod === "liqpay" && (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>LiqPay (ПриватБанк)</legend>
                <div className={cStyles.liqpaySection}>
                  <div className={cStyles.liqpayInfo}>
                    <span className={cStyles.liqpayIcon} aria-hidden="true">🔒</span>
                    <div>
                      <p className={cStyles.liqpayText}>
                        Після натискання &quot;Сплатити&quot; ви будете перенаправлені
                        на захищену сторінку LiqPay для введення даних картки.
                      </p>
                      <p className={cStyles.liqpayHint}>
                        Підтримуються: Visa, Mastercard, ПриватБанк
                      </p>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {form.paymentMethod === "paypal" && (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>PayPal</legend>
                <div className={cStyles.paypalSection}>
                  <button
                    type="button"
                    className={cStyles.paypalBtn}
                    disabled={form.isSubmitting}
                  >
                    Перейти до PayPal
                  </button>
                  <p className={cStyles.paypalHint}>
                    Ви будете перенаправлені на сайт PayPal для завершення оплати
                  </p>
                </div>
              </fieldset>
            )}

            {/* Promo code (mobile) */}
            <div className={styles.promoMobile}>
              <PromoCode
                onApply={form.handlePromoApply}
                onRemove={form.handlePromoRemove}
                appliedCode={form.promoCode}
                discount={form.promoDiscount}
                disabled={form.isSubmitting}
              />
            </div>

            {/* Consent */}
            <div className={cStyles.consentSection}>
              <label className={cStyles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) => form.setTermsAccepted(e.target.checked)}
                  disabled={form.isSubmitting}
                  aria-required="true"
                />
                <span>
                  Я погоджуюсь з{" "}
                  <button
                    type="button"
                    className={cStyles.termsLink}
                    onClick={() => form.setShowTermsModal(true)}
                  >
                    умовами покупки
                  </button>
                </span>
              </label>

              {form.session?.user && (
                <label className={cStyles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.savePaymentData}
                    onChange={(e) =>
                      form.setSavePaymentData(e.target.checked)
                    }
                    disabled={form.isSubmitting}
                  />
                  <span>Зберегти платіжні дані для наступних покупок</span>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className={cStyles.actionsRow}>
              <button
                type="submit"
                className={cStyles.placeButton}
                disabled={!form.isFormValid || form.isSubmitting}
              >
                {form.isSubmitting ? (
                  <>
                    <span className={cStyles.spinner} aria-hidden="true" />
                    Обробка...
                  </>
                ) : (
                  `Сплатити ${form.formatPrice(form.total)}`
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
            items={form.items}
            subtotal={form.subtotal}
            tax={form.tax}
            total={form.total}
            promoDiscount={form.promoDiscount}
          />

          <div className={styles.promoDesktop}>
            <PromoCode
              onApply={form.handlePromoApply}
              onRemove={form.handlePromoRemove}
              appliedCode={form.promoCode}
              discount={form.promoDiscount}
              disabled={form.isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* LiqPay redirect form (auto-submits when data is ready) */}
      {form.liqpayData && form.liqpaySignature && (
        <LiqPayCheckout
          data={form.liqpayData}
          signature={form.liqpaySignature}
        />
      )}

      {/* Server error message */}
      {form.orderServerSaveMessage && !form.showReceipt && (
        <div className={cStyles.serverError} role="alert">
          {form.orderServerSaveMessage}
        </div>
      )}

      {/* Loading overlay */}
      {form.isLoading && (
        <div className={cStyles.loaderOverlay} aria-live="assertive">
          <div className={cStyles.loaderContent}>
            <div className={cStyles.loaderRing} />
            <span>Оформлюємо ваше замовлення...</span>
          </div>
        </div>
      )}

      {/* Terms modal */}
      <TermsModal
        isOpen={form.showTermsModal}
        onClose={() => form.setShowTermsModal(false)}
      />

      {/* Receipt modal */}
      {form.showReceipt && (
        <ReceiptModal
          orderNumber={form.orderNumber}
          email={form.email}
          items={form.items}
          activationKeys={form.activationKeys}
          total={form.total}
          serverSaveMessage={form.orderServerSaveMessage}
          onClose={form.handleReceiptClose}
        />
      )}
    </div>
  );
}
