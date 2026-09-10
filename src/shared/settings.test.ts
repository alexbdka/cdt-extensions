import { describe, expect, it } from "vitest";
import {
  DEFAULT_POSITION,
  DEFAULT_SETTINGS,
  STRATEGY_ORDER,
  clampThreshold,
  normalizePosition,
  normalizeStrategies,
} from "./settings";

describe("normalizeStrategies", () => {
  it("returns defaults for non-array values", () => {
    expect(normalizeStrategies(null)).toEqual(STRATEGY_ORDER);
    expect(normalizeStrategies(undefined)).toEqual(STRATEGY_ORDER);
    expect(normalizeStrategies("authors")).toEqual(STRATEGY_ORDER);
  });

  it("filters out unknown strategies", () => {
    expect(normalizeStrategies(["authors", "unknown", "title"])).toEqual(["authors", "title"]);
  });

  it("preserves valid order", () => {
    expect(normalizeStrategies(["title", "authors"])).toEqual(["title", "authors"]);
  });

  it("falls back to defaults when all strategies are invalid", () => {
    expect(normalizeStrategies(["foo", "bar", 123])).toEqual(STRATEGY_ORDER);
  });
});

describe("normalizePosition", () => {
  it("returns defaults for invalid input", () => {
    expect(normalizePosition(null)).toEqual(DEFAULT_POSITION);
    expect(normalizePosition("invalid")).toEqual(DEFAULT_POSITION);
    expect(normalizePosition({})).toEqual(DEFAULT_POSITION);
  });

  it("clamps negative values to 0", () => {
    expect(normalizePosition({ bottom: -10, right: -5 })).toEqual({
      bottom: 0,
      right: 0,
    });
  });

  it("keeps positive values", () => {
    expect(normalizePosition({ bottom: 42, right: 99 })).toEqual({
      bottom: 42,
      right: 99,
    });
  });

  it("handles string numbers", () => {
    expect(normalizePosition({ bottom: "12", right: "34" })).toEqual({
      bottom: 12,
      right: 34,
    });
  });
});

describe("clampThreshold", () => {
  it("returns default for invalid values", () => {
    expect(clampThreshold(undefined)).toBe(DEFAULT_SETTINGS.levenshteinThreshold);
    expect(clampThreshold("abc")).toBe(DEFAULT_SETTINGS.levenshteinThreshold);
    expect(clampThreshold(NaN)).toBe(DEFAULT_SETTINGS.levenshteinThreshold);
  });

  it("clamps to minimum 0.1", () => {
    expect(clampThreshold(0)).toBe(0.1);
    expect(clampThreshold(-1)).toBe(0.1);
  });

  it("clamps to maximum 0.8", () => {
    expect(clampThreshold(1)).toBe(0.8);
    expect(clampThreshold(999)).toBe(0.8);
  });

  it("keeps valid values", () => {
    expect(clampThreshold(0.3)).toBe(0.3);
    expect(clampThreshold(0.75)).toBe(0.75);
  });
});
