"use client";

import React from "react";
import styles from "./checkout.module.css";

/**
 * Displays SSL security badge and accepted payment method logos.
 * Builds trust during the checkout flow.
 */
export default function SecurityBadges() {
  return (
    <div className={styles.securitySection}>
      <div className={styles.sslBadge} aria-label="Захищене з'єднання SSL 256-біт">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Захищене з&apos;єднання (SSL 256-біт)</span>
      </div>

      <div className={styles.paymentBadges} aria-label="Підтримувані способи оплати">
        <span className={styles.badge} data-brand="visa">VISA</span>
        <span className={styles.badge} data-brand="mastercard">Mastercard</span>
        <span className={styles.badge} data-brand="maestro">Maestro</span>
        <span className={styles.badge} data-brand="paypal">PayPal</span>
        <span className={styles.badge} data-brand="applepay">
          <ApplePayIcon />
          Pay
        </span>
        <span className={styles.badge} data-brand="googlepay">
          <GooglePayIcon />
          Pay
        </span>
      </div>
    </div>
  );
}

function ApplePayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83" />
      <path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
    </svg>
  );
}

function GooglePayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}
