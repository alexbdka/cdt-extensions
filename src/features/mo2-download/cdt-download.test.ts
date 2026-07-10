import { describe, expect, it } from "vitest";
import { URLParser } from "./cdt-download";

describe("URLParser.getDefaultModManagerGameId", () => {
  it("returns null for unknown category", () => {
    expect(URLParser.getDefaultModManagerGameId("unknown")).toBeNull();
  });

  it("maps known CdT categories to mod manager game ids", () => {
    expect(URLParser.getDefaultModManagerGameId("fallout3")).toBe("fallout3");
    expect(URLParser.getDefaultModManagerGameId("fallout4")).toBe("fallout4");
    expect(URLParser.getDefaultModManagerGameId("fallout-new-vegas")).toBe("falloutnv");
    expect(URLParser.getDefaultModManagerGameId("morrowind")).toBe("morrowind");
    expect(URLParser.getDefaultModManagerGameId("oblivion")).toBe("oblivion");
  });
});

describe("URLParser.getModManagerGameIdFromDownloadUrl", () => {
  it("detects Skyrim SE variants", () => {
    const modPage = { category: "skyrim", modId: "123" };
    expect(
      URLParser.getModManagerGameIdFromDownloadUrl(
        new URL("https://example.com/skyrim/telechargement-se/123"),
        modPage,
      ),
    ).toBe("skyrimse");
    expect(
      URLParser.getModManagerGameIdFromDownloadUrl(
        new URL("https://example.com/skyrim/telechargement_se/123"),
        modPage,
      ),
    ).toBe("skyrimse");
    expect(
      URLParser.getModManagerGameIdFromDownloadUrl(
        new URL("https://example.com/skyrim/sse/123"),
        modPage,
      ),
    ).toBe("skyrimse");
  });

  it("falls back to legacy Skyrim when no SE marker", () => {
    const modPage = { category: "skyrim", modId: "123" };
    expect(
      URLParser.getModManagerGameIdFromDownloadUrl(
        new URL("https://example.com/skyrim/telechargement/123"),
        modPage,
      ),
    ).toBe("skyrim");
  });

  it("uses default mapping for non-skyrim categories", () => {
    const modPage = { category: "fallout4", modId: "456" };
    expect(
      URLParser.getModManagerGameIdFromDownloadUrl(
        new URL("https://example.com/fallout4/telechargement/456"),
        modPage,
      ),
    ).toBe("fallout4");
  });
});

describe("URLParser.createDownloadTarget", () => {
  it("returns null when gameId cannot be resolved", () => {
    const modPage = { category: "unknown", modId: "123" };
    const url = new URL("https://example.com/unknown/telechargement/123");
    expect(URLParser.createDownloadTarget(url, modPage)).toBeNull();
  });

  it("creates a target for a known game", () => {
    const modPage = { category: "fallout4", modId: "123" };
    const url = new URL("https://example.com/fallout4/telechargement/123");
    expect(URLParser.createDownloadTarget(url, modPage)).toEqual({
      downloadUrl: url.toString(),
      gameId: "fallout4",
    });
  });
});

describe("URLParser.buildFallbackDownloadUrl", () => {
  it("builds a fallback URL from a mod page", () => {
    const modPage = { category: "fallout4", modId: "123" };
    const url = URLParser.buildFallbackDownloadUrl(modPage);
    expect(url.pathname).toBe("/fallout4/telechargement/123");
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
  });
});
