/** Supported card network types. */
export type CardType = "visa" | "mastercard" | "maestro" | "amex" | "unknown";

/** Human-readable labels for each card type. */
export const CARD_LABELS: Record<CardType, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  maestro: "Maestro",
  amex: "American Express",
  unknown: "",
};

/**
 * Detects the card network from the first digits of a card number.
 *
 * @param number - Raw or formatted card number string
 * @returns Detected card type
 *
 * @example
 * ```ts
 * detectCardType("4111 1111") // "visa"
 * detectCardType("5425")      // "mastercard"
 * detectCardType("3782")      // "amex"
 * ```
 */
export function detectCardType(number: string): CardType {
  const cleaned = number.replace(/\s/g, "");
  if (!cleaned) return "unknown";

  if (/^3[47]/.test(cleaned)) return "amex";

  if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(cleaned)) return "maestro";

  if (/^5[1-5]/.test(cleaned)) return "mastercard";
  const fourDigits = parseInt(cleaned.substring(0, 4), 10);
  if (fourDigits >= 2221 && fourDigits <= 2720) return "mastercard";

  if (/^4/.test(cleaned)) return "visa";

  return "unknown";
}

/**
 * Formats a raw card number string into grouped digits.
 * - Standard cards (Visa, MC, Maestro): XXXX XXXX XXXX XXXX
 * - Amex: XXXX XXXXXX XXXXX
 *
 * @param value - Raw input value (may contain non-digit chars)
 * @returns Formatted card number string
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const cardType = detectCardType(digits);
  const maxLen = cardType === "amex" ? 15 : 16;
  const trimmed = digits.slice(0, maxLen);

  if (cardType === "amex") {
    const parts = [
      trimmed.slice(0, 4),
      trimmed.slice(4, 10),
      trimmed.slice(10, 15),
    ];
    return parts.filter(Boolean).join(" ");
  }

  const parts: string[] = [];
  for (let i = 0; i < trimmed.length; i += 4) {
    parts.push(trimmed.slice(i, i + 4));
  }
  return parts.join(" ");
}

/**
 * Formats an expiry date input as MM/YY.
 *
 * @param value - Raw input value
 * @returns Formatted expiry string
 */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length === 0) return "";

  let month = digits.slice(0, 2);
  if (month.length === 1 && parseInt(month, 10) > 1) {
    month = "0" + month;
  }

  if (digits.length <= 2) {
    if (digits.length === 2) {
      const m = parseInt(month, 10);
      if (m < 1) month = "01";
      if (m > 12) month = "12";
      return month + "/";
    }
    return month;
  }

  const year = digits.slice(2, 4);
  const m = parseInt(month, 10);
  if (m < 1) month = "01";
  if (m > 12) month = "12";

  return month + "/" + year;
}

/**
 * Returns the expected number of raw digits for a given card type.
 *
 * @param cardType - Detected card type
 * @returns Max digit count (15 for Amex, 16 otherwise)
 */
export function getCardMaxDigits(cardType: CardType): number {
  return cardType === "amex" ? 15 : 16;
}

/**
 * Returns expected CVV length for a given card type.
 *
 * @param cardType - Detected card type
 * @returns 4 for Amex, 3 for all others
 */
export function getCvvLength(cardType: CardType): number {
  return cardType === "amex" ? 4 : 3;
}
