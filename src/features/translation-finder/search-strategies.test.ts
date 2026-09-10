import { describe, expect, it, vi } from "vitest";
import {
  AuthorsSearchStrategy,
  TitleSearchStrategy,
  UploaderSearchStrategy,
  type TranslationSearchClient,
} from "./search-strategies";
import type { TranslationResult } from "./types";

function createMockService(
  overrides: Partial<TranslationSearchClient> = {},
): TranslationSearchClient {
  return {
    searchByCreator: vi.fn().mockResolvedValue(null),
    searchByTitle: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe("AuthorsSearchStrategy", () => {
  it("returns null when no authors", async () => {
    const service = createMockService();
    const strategy = new AuthorsSearchStrategy(service);
    const result = await strategy.execute({
      modTitle: "Mod",
      uploader: "uploader",
      authors: [],
    });
    expect(result).toBeNull();
    expect(service.searchByCreator).not.toHaveBeenCalled();
  });

  it("tries each author until a match is found", async () => {
    const match: TranslationResult = { name: "Match", link: "/match" };
    const service = createMockService({
      searchByCreator: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(match),
    });
    const strategy = new AuthorsSearchStrategy(service);
    const result = await strategy.execute({
      modTitle: "Mod",
      uploader: "uploader",
      authors: ["Alice", "Bob"],
    });
    expect(result).toEqual(match);
    expect(service.searchByCreator).toHaveBeenCalledWith("Alice", "author");
    expect(service.searchByCreator).toHaveBeenCalledWith("Bob", "author");
  });
});

describe("UploaderSearchStrategy", () => {
  it("returns null when no uploader", async () => {
    const service = createMockService();
    const strategy = new UploaderSearchStrategy(service);
    const result = await strategy.execute({
      modTitle: "Mod",
      uploader: "",
      authors: [],
    });
    expect(result).toBeNull();
  });

  it("searches by uploader", async () => {
    const match: TranslationResult = { name: "Match", link: "/match" };
    const service = createMockService({
      searchByCreator: vi.fn().mockResolvedValue(match),
    });
    const strategy = new UploaderSearchStrategy(service);
    const result = await strategy.execute({
      modTitle: "Mod",
      uploader: "UploaderName",
      authors: [],
    });
    expect(result).toEqual(match);
    expect(service.searchByCreator).toHaveBeenCalledWith("UploaderName", "uploader");
  });
});

describe("TitleSearchStrategy", () => {
  it("returns null when no title", async () => {
    const service = createMockService();
    const strategy = new TitleSearchStrategy(service);
    const result = await strategy.execute({
      modTitle: "",
      uploader: "uploader",
      authors: [],
    });
    expect(result).toBeNull();
  });

  it("searches by title", async () => {
    const match: TranslationResult = { name: "Match", link: "/match" };
    const service = createMockService({
      searchByTitle: vi.fn().mockResolvedValue(match),
    });
    const strategy = new TitleSearchStrategy(service);
    const result = await strategy.execute({
      modTitle: "Mod Title",
      uploader: "uploader",
      authors: [],
    });
    expect(result).toEqual(match);
    expect(service.searchByTitle).toHaveBeenCalledWith("Mod Title");
  });
});
