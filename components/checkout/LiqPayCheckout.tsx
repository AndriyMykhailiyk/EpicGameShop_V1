"use client";

import { useEffect, useRef } from "react";
import { LIQPAY_CHECKOUT_URL } from "@/lib/payment/liqpayConstants";

interface LiqPayCheckoutProps {
  data: string;
  signature: string;
}

/**
 * Hidden form that automatically submits to LiqPay checkout.
 * Once mounted with valid data + signature, it immediately
 * redirects the user to the LiqPay payment page.
 *
 * @param data - Base64-encoded LiqPay payment data
 * @param signature - Signed hash for the data
 */
export default function LiqPayCheckout({ data, signature }: LiqPayCheckoutProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (formRef.current && data && signature && !submitted.current) {
      submitted.current = true;
      formRef.current.submit();
    }
  }, [data, signature]);

  return (
    <form
      ref={formRef}
      method="POST"
      action={LIQPAY_CHECKOUT_URL}
      acceptCharset="utf-8"
      style={{ display: "none" }}
    >
      <input type="hidden" name="data" value={data} />
      <input type="hidden" name="signature" value={signature} />
    </form>
  );
}
