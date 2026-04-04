import { createHash } from "crypto";

/**
 * LiqPay checkout URL for redirecting users to the payment page.
 */
export const LIQPAY_CHECKOUT_URL = "https://www.liqpay.ua/api/3/checkout";

/**
 * LiqPay API URL for server-to-server requests (status check, etc.).
 */
export const LIQPAY_API_URL = "https://www.liqpay.ua/api/request";

/**
 * Encodes a JavaScript object as a base64-encoded JSON string.
 * This is the `data` parameter required by LiqPay API.
 *
 * @param params - Plain object with LiqPay API parameters
 * @returns Base64-encoded JSON string
 *
 * @example
 * ```ts
 * const data = encodeLiqPayData({ action: "pay", amount: 100 });
 * ```
 */
export function encodeLiqPayData(params: Record<string, unknown>): string {
  const json = JSON.stringify(params);
  return Buffer.from(json).toString("base64");
}

/**
 * Decodes a base64-encoded LiqPay `data` string back to a plain object.
 *
 * @param base64Data - Base64-encoded JSON string from LiqPay
 * @returns Parsed object
 */
export function decodeLiqPayData(base64Data: string): Record<string, unknown> {
  const json = Buffer.from(base64Data, "base64").toString("utf-8");
  return JSON.parse(json) as Record<string, unknown>;
}

/**
 * Creates a SHA-1 signature for LiqPay API authentication.
 * Signature = base64( sha1( private_key + data + private_key ) )
 *
 * @param privateKey - LiqPay private key
 * @param data - Base64-encoded data string
 * @returns Base64-encoded SHA-1 signature
 */
export function createLiqPaySignature(privateKey: string, data: string): string {
  const signString = privateKey + data + privateKey;
  const sha1 = createHash("sha1").update(signString).digest("base64");
  return sha1;
}

/**
 * Verifies that a LiqPay callback signature matches the expected value.
 *
 * @param privateKey - LiqPay private key
 * @param data - Base64-encoded data from the callback
 * @param receivedSignature - Signature received from LiqPay
 * @returns true if the signature is valid
 */
export function verifyLiqPaySignature(
  privateKey: string,
  data: string,
  receivedSignature: string,
): boolean {
  const expectedSignature = createLiqPaySignature(privateKey, data);
  return expectedSignature === receivedSignature;
}

/**
 * Builds and signs a complete LiqPay payment request.
 *
 * @param params - Payment parameters (amount, description, order_id, etc.)
 * @param publicKey - LiqPay public key
 * @param privateKey - LiqPay private key
 * @returns Object with `data` and `signature` ready for form submission
 */
export function buildLiqPayPayment(
  params: {
    action: string;
    amount: number;
    currency: string;
    description: string;
    order_id: string;
    result_url: string;
    server_url: string;
    sandbox?: boolean;
  },
  publicKey: string,
  privateKey: string,
): { data: string; signature: string } {
  const payload: Record<string, unknown> = {
    public_key: publicKey,
    version: "3",
    action: params.action,
    amount: params.amount,
    currency: params.currency,
    description: params.description,
    order_id: params.order_id,
    result_url: params.result_url,
    server_url: params.server_url,
  };

  if (params.sandbox) {
    payload.sandbox = 1;
  }

  const data = encodeLiqPayData(payload);
  const signature = createLiqPaySignature(privateKey, data);

  return { data, signature };
}

/**
 * Builds a signed LiqPay status-check request for server-to-server API call.
 *
 * @param orderId - The order_id to check
 * @param publicKey - LiqPay public key
 * @param privateKey - LiqPay private key
 * @returns Object with `data` and `signature` for the status API
 */
export function buildLiqPayStatusRequest(
  orderId: string,
  publicKey: string,
  privateKey: string,
): { data: string; signature: string } {
  const payload = {
    public_key: publicKey,
    version: "3",
    action: "status",
    order_id: orderId,
  };

  const data = encodeLiqPayData(payload);
  const signature = createLiqPaySignature(privateKey, data);

  return { data, signature };
}
