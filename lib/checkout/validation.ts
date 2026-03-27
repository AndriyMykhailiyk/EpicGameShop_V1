import { type CardType, getCvvLength } from "./cardUtils";

/** Result returned by every validation function. */
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

const VALID: ValidationResult = { isValid: true, error: null };

/**
 * Validates an email address.
 *
 * @param email - Email string to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: "Email є обов'язковим полем" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Введіть коректну email-адресу" };
  }
  return VALID;
}

/**
 * Validates a card number string (digits only, no spaces).
 *
 * @param number - Card number with spaces stripped
 * @param expectedLength - Expected digit count (15 for Amex, 16 otherwise)
 * @returns Validation result
 */
export function validateCardNumber(
  number: string,
  expectedLength: number,
): ValidationResult {
  const digits = number.replace(/\s/g, "");
  if (!digits) {
    return { isValid: false, error: "Номер картки є обов'язковим" };
  }
  if (!/^\d+$/.test(digits)) {
    return { isValid: false, error: "Номер картки має містити лише цифри" };
  }
  if (digits.length < expectedLength) {
    return {
      isValid: false,
      error: `Номер картки має містити ${expectedLength} цифр`,
    };
  }
  if (!luhnCheck(digits)) {
    return { isValid: false, error: "Невірний номер картки" };
  }
  return VALID;
}

/**
 * Luhn algorithm check for card number validity.
 *
 * @param digits - Digit-only card number string
 * @returns true if the number passes Luhn check
 */
function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

/**
 * Validates card expiry in MM/YY format.
 *
 * @param expiry - Expiry string like "03/26"
 * @returns Validation result
 */
export function validateExpiry(expiry: string): ValidationResult {
  if (!expiry.trim()) {
    return { isValid: false, error: "Термін дії є обов'язковим" };
  }

  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    return { isValid: false, error: "Формат: MM/YY" };
  }

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Місяць має бути від 01 до 12" };
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: "Термін дії картки минув" };
  }

  return VALID;
}

/**
 * Validates CVV/CVC code.
 *
 * @param cvv - CVV string
 * @param cardType - Detected card type (Amex expects 4, others 3)
 * @returns Validation result
 */
export function validateCvv(
  cvv: string,
  cardType: CardType,
): ValidationResult {
  if (!cvv.trim()) {
    return { isValid: false, error: "CVV є обов'язковим" };
  }

  const expected = getCvvLength(cardType);

  if (!/^\d+$/.test(cvv)) {
    return { isValid: false, error: "CVV має містити лише цифри" };
  }

  if (cvv.length !== expected) {
    return {
      isValid: false,
      error: `CVV має містити ${expected} цифр${expected === 4 ? "и" : ""}`,
    };
  }

  return VALID;
}

/**
 * Validates the cardholder name (Latin letters and spaces only).
 *
 * @param name - Cardholder name string
 * @returns Validation result
 */
export function validateCardholderName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: "Ім'я на картці є обов'язковим" };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return {
      isValid: false,
      error: "Використовуйте лише латинські літери, як зазначено на картці",
    };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Ім'я занадто коротке" };
  }

  return VALID;
}
