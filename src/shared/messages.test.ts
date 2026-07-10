import { describe, expect, it } from "vitest";
import { isBackgroundMessage } from "./messages";

describe("isBackgroundMessage", () => {
  it("returns false for non-object values", () => {
    expect(isBackgroundMessage(null)).toBe(false);
    expect(isBackgroundMessage(undefined)).toBe(false);
    expect(isBackgroundMessage("message")).toBe(false);
    expect(isBackgroundMessage(42)).toBe(false);
  });

  it("returns false when type is missing or not a string", () => {
    expect(isBackgroundMessage({})).toBe(false);
    expect(isBackgroundMessage({ type: 123 })).toBe(false);
  });

  it("returns true for known message types", () => {
    expect(isBackgroundMessage({ type: "cdt:postFormViaTab" })).toBe(true);
    expect(isBackgroundMessage({ type: "cdt:resolveDownload" })).toBe(true);
    expect(isBackgroundMessage({ type: "cdt:openTab" })).toBe(true);
    expect(isBackgroundMessage({ type: "cdt:closeTab" })).toBe(true);
  });

  it("returns false for unknown message types", () => {
    expect(isBackgroundMessage({ type: "cdt:unknown" })).toBe(false);
    expect(isBackgroundMessage({ type: "other" })).toBe(false);
  });
});
