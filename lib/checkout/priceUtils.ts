import type { CartItem } from "@/lib/store/cartSlice";

/**
 * Extracts a numeric price from a CartItem that may store prices
 * in several different shapes (string with currency, plain number, nested object).
 *
 * @param item - Cart item with various price fields
 * @returns Parsed numeric price (0 when nothing can be resolved)
 *
 * @example
 * ```ts
 * getItemPrice({ discountedPrice: "1,199.25 грн" }) // 1199.25
 * getItemPrice({ price: 499 })                       // 499
 * ```
 */
export function getItemPrice(item: CartItem): number {
  const priceVariants: unknown[] = [
    item.discountedPrice,
    (item as unknown as Record<string, unknown>).price,
    item.originalPrice,
  ];

  for (const variant of priceVariants) {
    if (variant === undefined || variant === null) continue;

    if (typeof variant === "number") return variant;

    if (typeof variant === "object" && variant !== null) {
      const current = (variant as Record<string, unknown>).current;
      if (typeof current === "number") return current;
      if (typeof current === "string") {
        const parsed = parsePriceString(current);
        if (parsed > 0) return parsed;
      }
    }

    if (typeof variant === "string") {
      const parsed = parsePriceString(variant);
      if (parsed > 0) return parsed;
    }
  }

  return 0;
}

/**
 * Parses a price string that may contain currency symbols, thousands
 * separators (both comma and dot), and decimal separators.
 *
 * @param raw - Raw price string like "1,199,25 грн" or "1199.25"
 * @returns Parsed float or 0 when unparseable
 */
export function parsePriceString(raw: string): number {
  let cleaned = raw.replace(/[^\d.,]/g, "");

  const commaCount = (cleaned.match(/,/g) || []).length;
  const dotCount = (cleaned.match(/\./g) || []).length;

  if (commaCount > 1) {
    const lastIdx = cleaned.lastIndexOf(",");
    cleaned =
      cleaned.substring(0, lastIdx).replace(/,/g, "") +
      "." +
      cleaned.substring(lastIdx + 1);
  } else if (commaCount === 1 && dotCount === 0) {
    const parts = cleaned.split(",");
    if (parts[1] && parts[1].length <= 2) {
      cleaned = cleaned.replace(",", ".");
    } else {
      cleaned = cleaned.replace(",", "");
    }
  } else if (dotCount > 1) {
    const lastIdx = cleaned.lastIndexOf(".");
    cleaned =
      cleaned.substring(0, lastIdx).replace(/\./g, "") +
      "." +
      cleaned.substring(lastIdx + 1);
  } else {
    cleaned = cleaned.replace(",", ".");
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? 0 : result;
}

/**
 * Formats a number as a UAH price string with 2 decimal places.
 *
 * @param amount - Numeric amount
 * @returns Formatted string like "1 199.25 грн"
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} грн`;
}
