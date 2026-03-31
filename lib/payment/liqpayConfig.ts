/**
 * LiqPay configuration loaded from environment variables.
 * Validates that all required keys are present before use.
 */

interface LiqPayConfig {
  publicKey: string;
  privateKey: string;
  sandbox: boolean;
  baseUrl: string;
}

let _config: LiqPayConfig | null = null;

/**
 * Returns the validated LiqPay configuration.
 * Throws if required env variables are missing.
 *
 * Required environment variables:
 * - LIQPAY_PUBLIC_KEY
 * - LIQPAY_PRIVATE_KEY
 *
 * Optional:
 * - LIQPAY_SANDBOX (defaults to "1" = sandbox enabled)
 * - NEXT_PUBLIC_APP_URL (defaults to "http://localhost:3000")
 */
export function getLiqPayConfig(): LiqPayConfig {
  if (_config) return _config;

  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      "Missing LiqPay environment variables: LIQPAY_PUBLIC_KEY and LIQPAY_PRIVATE_KEY are required",
    );
  }

  const sandboxEnv = process.env.LIQPAY_SANDBOX ?? "1";
  const sandbox = sandboxEnv === "1" || sandboxEnv === "true";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  _config = { publicKey, privateKey, sandbox, baseUrl };
  return _config;
}
