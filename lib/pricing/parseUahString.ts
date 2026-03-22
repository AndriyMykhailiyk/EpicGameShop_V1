/**
 * Parses a Ukrainian storefront price string into a numeric UAH amount.
 * Handles mixed thousand/decimal separators used across the catalog.
 *
 * @param raw - Price label such as "1,199,25 грн." or "Безкоштовна"
 * @returns Parsed positive number, or 0 when not parseable / free text
 *
 * @example
 * parseUahString("1 199,25 грн.");
 * // => 1199.25
 */
export function parseUahString(raw: string | undefined | null): number {
  try {
    if (raw === undefined || raw === null) {
      return 0;
    }
    const lower = raw.toLowerCase();
    if (lower.includes("безкоштов") || lower.includes("free")) {
      return 0;
    }

    let cleaned = raw.replace(/[^\d.,]/g, "");
    if (!cleaned) {
      return 0;
    }

    const commaCount = (cleaned.match(/,/g) || []).length;
    const dotCount = (cleaned.match(/\./g) || []).length;

    if (commaCount > 1) {
      const lastCommaIndex = cleaned.lastIndexOf(",");
      cleaned =
        cleaned.substring(0, lastCommaIndex).replace(/,/g, "") +
        "." +
        cleaned.substring(lastCommaIndex + 1);
    } else if (commaCount === 1 && dotCount === 0) {
      const parts = cleaned.split(",");
      if (parts[1] && parts[1].length <= 2) {
        cleaned = cleaned.replace(",", ".");
      } else {
        cleaned = cleaned.replace(",", "");
      }
    } else if (dotCount > 1) {
      const lastDotIndex = cleaned.lastIndexOf(".");
      cleaned =
        cleaned.substring(0, lastDotIndex).replace(/\./g, "") +
        "." +
        cleaned.substring(lastDotIndex + 1);
    } else {
      cleaned = cleaned.replace(",", ".");
    }

    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  } catch {
    return 0;
  }
}
