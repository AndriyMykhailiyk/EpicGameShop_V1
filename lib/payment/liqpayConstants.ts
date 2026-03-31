/**
 * LiqPay constants safe for client-side imports.
 * Separated from liqpay.ts to avoid pulling Node.js `crypto` into browser bundles.
 */

/**
 * LiqPay checkout URL for redirecting users to the payment page.
 */
export const LIQPAY_CHECKOUT_URL = "https://www.liqpay.ua/api/3/checkout";
