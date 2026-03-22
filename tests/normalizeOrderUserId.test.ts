import { describe, expect, it } from "vitest";
import { normalizeOrderUserId } from "@/lib/orders/normalizeOrderUserId";

const valid =
  "550e8400-e29b-41d4-a716-446655440000";

describe("normalizeOrderUserId", () => {
  it("returns the same string for a valid UUID", () => {
    expect(normalizeOrderUserId(valid)).toBe(valid);
  });

  it("returns null for OAuth-style ids", () => {
    expect(normalizeOrderUserId("112233445566778899001")).toBeNull();
    expect(normalizeOrderUserId("google-sub-abc")).toBeNull();
  });

  it("returns null for empty or missing values", () => {
    expect(normalizeOrderUserId(null)).toBeNull();
    expect(normalizeOrderUserId(undefined)).toBeNull();
    expect(normalizeOrderUserId("")).toBeNull();
    expect(normalizeOrderUserId("   ")).toBeNull();
  });

  it("trims whitespace around a UUID", () => {
    expect(normalizeOrderUserId(`  ${valid}  `)).toBe(valid);
  });
});
