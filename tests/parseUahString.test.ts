import { describe, expect, it } from "vitest";
import { parseUahString } from "@/lib/pricing/parseUahString";

describe("parseUahString", () => {
  it("returns 0 for empty or free labels", () => {
    expect(parseUahString("")).toBe(0);
    expect(parseUahString("Безкоштовна")).toBe(0);
  });

  it("parses simple decimal with comma", () => {
    expect(parseUahString("1 199,25 грн.")).toBeCloseTo(1199.25);
  });

  it("parses values with multiple commas", () => {
    expect(parseUahString("1,199,25")).toBeCloseTo(1199.25);
  });
});
