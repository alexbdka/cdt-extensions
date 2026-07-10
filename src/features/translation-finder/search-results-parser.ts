import type { ParsedSearchResults, TranslationResult } from "./types";

export class SearchResultsParser {
  static parse(payload: string | null | undefined): ParsedSearchResults {
    const trimmed = (payload ?? "").trim();
    if (!trimmed) {
      return { mods: [], source: "empty" };
    }

    const jsonMods = this.tryParseJson(trimmed);
    if (jsonMods) {
      return { mods: jsonMods, source: "json" };
    }

    return { mods: [], source: "html" };
  }

  private static tryParseJson(payload: string): TranslationResult[] | null {
    try {
      if (!payload.startsWith("{") && !payload.startsWith("[")) {
        return null;
      }

      const data: unknown = JSON.parse(payload);
      const entries = this.extractEntries(data);
      return entries.map((entry) => ({
        name: this.extractString(entry.OriginalName || entry.Name),
        link: this.extractString(entry.Link),
      }));
    } catch {
      return null;
    }
  }

  private static extractEntries(data: unknown): Array<{
    OriginalName?: unknown;
    Name?: unknown;
    Link?: unknown;
  }> {
    if (typeof data !== "object" || data === null) {
      return [];
    }
    const entries = (data as { Entries?: unknown }).Entries;
    if (!Array.isArray(entries)) {
      return [];
    }
    return entries as Array<{ OriginalName?: unknown; Name?: unknown; Link?: unknown }>;
  }

  private static extractString(value: unknown): string {
    if (typeof value === "string") {
      return value;
    }
    return "";
  }
}
