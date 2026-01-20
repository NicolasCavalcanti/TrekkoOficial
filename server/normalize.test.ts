import { describe, expect, it } from "vitest";
import { normalizeIdentifier } from "./db";

describe("normalizeIdentifier", () => {
  it("removes dots from formatted CPF", () => {
    expect(normalizeIdentifier("123.456.789-00")).toBe("12345678900");
  });

  it("removes dashes from formatted CPF", () => {
    expect(normalizeIdentifier("123-456-789-00")).toBe("12345678900");
  });

  it("removes spaces from input", () => {
    expect(normalizeIdentifier("123 456 789 00")).toBe("12345678900");
  });

  it("handles mixed formatting", () => {
    expect(normalizeIdentifier("27.298.769.48-8")).toBe("27298769488");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeIdentifier("")).toBe("");
  });

  it("returns only digits from alphanumeric input", () => {
    expect(normalizeIdentifier("ABC123DEF456")).toBe("123456");
  });

  it("handles already clean numeric input", () => {
    expect(normalizeIdentifier("12345678900")).toBe("12345678900");
  });

  it("handles CNPJ format", () => {
    expect(normalizeIdentifier("12.345.678/0001-90")).toBe("12345678000190");
  });

  it("handles input with special characters", () => {
    expect(normalizeIdentifier("(11) 99999-9999")).toBe("11999999999");
  });

  it("handles input with tabs and newlines", () => {
    expect(normalizeIdentifier("123\t456\n789")).toBe("123456789");
  });
});
