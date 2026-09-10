import { describe, expect, it } from "vitest";
import { SearchResultsParser } from "./search-results-parser";

describe("SearchResultsParser.parse", () => {
  it("returns empty source for null/undefined/empty", () => {
    expect(SearchResultsParser.parse(null)).toEqual({
      mods: [],
      source: "empty",
    });
    expect(SearchResultsParser.parse(undefined)).toEqual({
      mods: [],
      source: "empty",
    });
    expect(SearchResultsParser.parse("   ")).toEqual({
      mods: [],
      source: "empty",
    });
  });

  it("returns html source for non-json text", () => {
    expect(SearchResultsParser.parse("<html></html>")).toEqual({
      mods: [],
      source: "html",
    });
  });

  it("parses a JSON payload with Entries", () => {
    const payload = JSON.stringify({
      Entries: [
        { OriginalName: "Mod One", Link: "/mods/1" },
        { Name: "Mod Two", Link: "/mods/2" },
      ],
    });
    expect(SearchResultsParser.parse(payload)).toEqual({
      mods: [
        { name: "Mod One", link: "/mods/1" },
        { name: "Mod Two", link: "/mods/2" },
      ],
      source: "json",
    });
  });

  it("ignores entries with non-string fields", () => {
    const payload = JSON.stringify({
      Entries: [
        { OriginalName: "Mod One", Link: "/mods/1" },
        { OriginalName: 123, Link: { url: "/mods/2" } },
      ],
    });
    expect(SearchResultsParser.parse(payload)).toEqual({
      mods: [
        { name: "Mod One", link: "/mods/1" },
        { name: "", link: "" },
      ],
      source: "json",
    });
  });

  it("returns html source for invalid JSON", () => {
    expect(SearchResultsParser.parse('{"Entries": [')).toEqual({
      mods: [],
      source: "html",
    });
  });
});
