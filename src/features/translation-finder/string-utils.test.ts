import { describe, expect, it } from "vitest";
import { StringUtils } from "./string-utils";

describe("StringUtils.normalize", () => {
  it("lowercases and trims", () => {
    expect(StringUtils.normalize("  Hello World  ")).toBe("hello world");
  });

  it("removes accents", () => {
    expect(StringUtils.normalize("Café")).toBe("cafe");
    expect(StringUtils.normalize("Élégant")).toBe("elegant");
  });

  it("removes special characters", () => {
    expect(StringUtils.normalize("Hello, World!")).toBe("hello world");
  });
});

describe("StringUtils.levenshteinDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(StringUtils.levenshteinDistance("hello", "hello")).toBe(0);
  });

  it("returns length for empty string", () => {
    expect(StringUtils.levenshteinDistance("hello", "")).toBe(5);
    expect(StringUtils.levenshteinDistance("", "hello")).toBe(5);
  });

  it("computes simple distances", () => {
    expect(StringUtils.levenshteinDistance("kitten", "sitting")).toBe(3);
    expect(StringUtils.levenshteinDistance("saturday", "sunday")).toBe(3);
  });
});

describe("StringUtils.calculateSimilarity", () => {
  it("returns 0 for identical strings", () => {
    expect(StringUtils.calculateSimilarity("hello", "hello")).toBe(0);
  });

  it("returns 1 for empty normalized strings", () => {
    expect(StringUtils.calculateSimilarity("!", "?")).toBe(1);
  });

  it("returns a value between 1 and 0 for different strings", () => {
    const similarity = StringUtils.calculateSimilarity("kitten", "sitting");
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThan(1);
  });
});
