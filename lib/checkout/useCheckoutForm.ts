"use client";

import { useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState } from "@/lib/store/store";
import { clearCart, type CartItem } from "@/lib/store/cartSlice";
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
import { buildReceiptEmailHtml } from "@/lib/checkout/emailTemplate";
import type { CardFormData } from "@/components/checkout/CardPaymentForm";

type PaymentMethod = "card" | "paypal" | "liqpay";

/**
 * Encapsulates all checkout form logic: email validation, promo codes,
 * order placement, receipt handling.
 */
export function useCheckoutForm() {
  const { data: session, status: sessionStatus } = useSession();
  const items = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardFormValid, setCardFormValid] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [savePaymentData, setSavePaymentData] = useState(false);

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
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [liqpayData, setLiqpayData] = useState<string | null>(null);
  const [liqpaySignature, setLiqpaySignature] = useState<string | null>(null);

  /* ─── Price calculations ─── */
  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0),
    [items],
  );
  const effectiveSubtotal = Math.max(0, subtotal - promoDiscount);
  const tax = +(effectiveSubtotal * 0.2).toFixed(2);
  const total = +(effectiveSubtotal + tax).toFixed(2);

  /* ─── Email ─── */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailTouched) setEmailError(validateEmail(val).error);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email).error);
  };

  /* ─── Card form ─── */
  const handleCardFormChange = useCallback(
    (_data: CardFormData, isValid: boolean) => {
      setCardFormValid(isValid);
    },
    [],
  );

  /* ─── Promo ─── */
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

  /* ─── Form validity ─── */
  const isFormValid = useMemo(() => {
    const emailOk = validateEmail(email).isValid;
    const paymentOk =
      paymentMethod === "paypal" ||
      paymentMethod === "liqpay" ||
      cardFormValid;
    return emailOk && paymentOk && termsAccepted && items.length > 0;
  }, [email, paymentMethod, cardFormValid, termsAccepted, items.length]);

  const isSubmitting = isLoading || isSendingEmail;

  /* ─── Email receipt ─── */
  const sendEmailReceipt = async (orderData: {
    orderNumber: string;
    items: { title: string; quantity: number; price: number }[];
    keys: { title: string; keys: string[] }[];
  }) => {
    setIsSendingEmail(true);
    try {
      const html = buildReceiptEmailHtml({
        orderNumber: orderData.orderNumber,
        items: orderData.items,
        keys: orderData.keys,
        subtotal,
        tax,
        total,
      });

      await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `Замовлення ${orderData.orderNumber} - EpicGame Shop`,
          html,
        }),
      });
    } catch {
      /* email delivery is optional */
    } finally {
      setIsSendingEmail(false);
    }
  };

  /* ─── Place order (card / PayPal — existing flow) ─── */
  const handlePlaceOrderClassic = async () => {
    setIsLoading(true);
    setOrderServerSaveMessage(null);

    try {
      mergePurchasedGames(items);
      const orderNo = generateOrderNumber();
      const { grouped, flat } = generateActivationKeys(items);

      setOrderNumber(orderNo);
      setActivationKeys(flat);

      saveOrderLocally({
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
      });

      try {
        const persistBody = buildServerOrderPayload({
          email,
          userId: session?.user?.id ?? null,
          orderNumber: orderNo,
          items: items as CartItem[],
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

  /* ─── Place order (LiqPay — real payment via PrivatBank) ─── */
  const handlePlaceOrderLiqPay = async () => {
    setIsLoading(true);
    setOrderServerSaveMessage(null);

    try {
      const payload = {
        email,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unitPrice: getItemPrice(item),
          lineTotal: getItemPrice(item) * item.quantity,
        })),
        subtotal: effectiveSubtotal,
        tax,
        total,
      };

      const res = await fetch("/api/payment/liqpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || "Помилка створення платежу");
      }

      const result = (await res.json()) as {
        data: string;
        signature: string;
        orderNumber: string;
        orderId: string;
      };

      mergePurchasedGames(items);
      setOrderNumber(result.orderNumber);
      setLiqpayData(result.data);
      setLiqpaySignature(result.signature);
    } catch {
      setIsLoading(false);
      setOrderServerSaveMessage("Не вдалося створити платіж LiqPay. Спробуйте ще раз.");
    }
  };

  /* ─── Place order (router) ─── */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (paymentMethod === "liqpay") {
      await handlePlaceOrderLiqPay();
    } else {
      await handlePlaceOrderClassic();
    }
  };

  /* ─── Receipt close ─── */
  const handleReceiptClose = () => {
    dispatch(clearCart());
    setShowReceipt(false);
    window.location.href = "/";
  };

  return {
    items,
    session,
    sessionStatus,
    email,
    emailTouched,
    emailError,
    handleEmailChange,
    handleEmailBlur,
    paymentMethod,
    setPaymentMethod,
    handleCardFormChange,
    termsAccepted,
    setTermsAccepted,
    savePaymentData,
    setSavePaymentData,
    promoCode,
    promoDiscount,
    handlePromoApply,
    handlePromoRemove,
    isFormValid,
    isSubmitting,
    isLoading,
    showReceipt,
    orderNumber,
    activationKeys,
    orderServerSaveMessage,
    showTermsModal,
    setShowTermsModal,
    subtotal,
    tax,
    total,
    formatPrice,
    handlePlaceOrder,
    handleReceiptClose,
    liqpayData,
    liqpaySignature,
  };
}
