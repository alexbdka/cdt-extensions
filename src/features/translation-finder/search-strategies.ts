import type { ModInfo, TranslationResult } from "./types";

export type CreatorSearchType = "author" | "uploader";

export interface TranslationSearchClient {
  searchByCreator(creator: string, type: CreatorSearchType): Promise<TranslationResult | null>;
  searchByTitle(title: string): Promise<TranslationResult | null>;
}

export abstract class SearchStrategy {
  protected searchService: TranslationSearchClient;

  constructor(searchService: TranslationSearchClient) {
    this.searchService = searchService;
  }

  abstract execute(modInfo: ModInfo): Promise<TranslationResult | null>;
}

export class AuthorsSearchStrategy extends SearchStrategy {
  async execute(modInfo: ModInfo): Promise<TranslationResult | null> {
    if (!modInfo.authors?.length) {
      return null;
    }

    for (const author of modInfo.authors) {
      const result = await this.searchService.searchByCreator(author, "author");
      if (result) {
        return result;
      }
    }

    return null;
  }
}

export class UploaderSearchStrategy extends SearchStrategy {
  async execute(modInfo: ModInfo): Promise<TranslationResult | null> {
    if (!modInfo.uploader) {
      return null;
    }
    return this.searchService.searchByCreator(modInfo.uploader, "uploader");
  }
}

export class TitleSearchStrategy extends SearchStrategy {
  async execute(modInfo: ModInfo): Promise<TranslationResult | null> {
    if (!modInfo.modTitle) {
      return null;
    }
    return this.searchService.searchByTitle(modInfo.modTitle);
  }
}
