import { CONFIG } from "./config";
import { HTTPClient } from "./http-client";
import { Logger } from "./logger";
import { SearchResultsParser } from "./search-results-parser";
import {
  AuthorsSearchStrategy,
  TitleSearchStrategy,
  UploaderSearchStrategy,
  type CreatorSearchType,
  type SearchStrategy,
  type TranslationSearchClient,
} from "./search-strategies";
import { StringUtils } from "./string-utils";
import type { GameConfig, ModInfo, TranslationResult } from "./types";

export class TranslationSearchService implements TranslationSearchClient {
  private gameConfig: GameConfig;
  private strategies: Record<string, SearchStrategy>;
  private currentModInfo: ModInfo | null;

  constructor(gameConfig: GameConfig) {
    this.gameConfig = gameConfig;
    this.strategies = this.createStrategies();
    this.currentModInfo = null;
  }

  async search(modInfo: ModInfo): Promise<TranslationResult | null> {
    this.currentModInfo = modInfo;
    Logger.info("Starting translation search", {
      strategies: CONFIG.search.strategies,
    });

    for (const strategyName of CONFIG.search.strategies) {
      const strategy = this.strategies[strategyName];
      if (!strategy) {
        continue;
      }

      try {
        const result = await strategy.execute(modInfo);
        if (result) {
          Logger.success(`Found match using ${strategyName} strategy`, result);
          return result;
        }
      } catch (error) {
        Logger.error(`${strategyName} strategy failed`, error);
      }
    }

    return null;
  }

  async searchByCreator(
    creator: string,
    type: CreatorSearchType,
  ): Promise<TranslationResult | null> {
    const params = new URLSearchParams({
      search: "basic",
      term: creator.replace(/\s+/g, "_"),
      name: "0",
      nameVO: "0",
      description: "0",
      authors: "1",
      translators: "1",
      testers: "0",
      proofreaders: "0",
      designers: "0",
      actors: "0",
      vostfr: "0",
      vf: "0",
      vfPart: "0",
      excludeIsNotProofread: "0",
      ...this.gameConfig.gameParams,
    });
    const referrer = `${this.gameConfig.endpoint.replace(
      "/api/recherche/simple",
      "/recherche",
    )}?${params.toString()}`;

    const response = await HTTPClient.makeRequest(this.gameConfig.endpoint, params, referrer);
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    Logger.info("Search response metadata", {
      status: response.status,
      contentType: response.contentType,
      finalUrl: response.finalUrl,
    });

    const { mods, source } = SearchResultsParser.parse(response.text);

    Logger.info(`${type} search results`, { modsFound: mods.length, source });
    return this.findBestMatch(mods);
  }

  async searchByTitle(title: string): Promise<TranslationResult | null> {
    const params = new URLSearchParams({
      search: "basic",
      term: title.replace(/\s+/g, "_"),
      name: "1",
      nameVO: "1",
      description: "0",
      authors: "0",
      translators: "1",
      testers: "0",
      proofreaders: "0",
      designers: "0",
      actors: "0",
      vostfr: "0",
      vf: "0",
      vfPart: "0",
      excludeIsNotProofread: "0",
      ...this.gameConfig.gameParams,
    });
    const referrer = `${this.gameConfig.endpoint.replace(
      "/api/recherche/simple",
      "/recherche",
    )}?${params.toString()}`;

    const response = await HTTPClient.makeRequest(this.gameConfig.endpoint, params, referrer);
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    Logger.info("Search response metadata", {
      status: response.status,
      contentType: response.contentType,
      finalUrl: response.finalUrl,
    });

    const { mods, source } = SearchResultsParser.parse(response.text);

    Logger.info("Title search results", { modsFound: mods.length, source });
    return this.findBestMatch(mods);
  }

  private createStrategies(): Record<string, SearchStrategy> {
    return {
      authors: new AuthorsSearchStrategy(this),
      uploader: new UploaderSearchStrategy(this),
      title: new TitleSearchStrategy(this),
    };
  }

  private findBestMatch(mods: TranslationResult[]): TranslationResult | null {
    if (!mods.length) {
      return null;
    }
    if (!this.currentModInfo?.modTitle) {
      return mods[0] ?? null;
    }

    let bestMatch = mods[0];
    let bestSimilarity = Infinity;

    for (const mod of mods) {
      const similarity = StringUtils.calculateSimilarity(this.currentModInfo.modTitle, mod.name);

      Logger.info("Comparing titles", {
        original: this.currentModInfo.modTitle,
        candidate: mod.name,
        similarity: similarity.toFixed(3),
      });

      if (similarity < bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = mod;
      }
    }

    if (bestSimilarity <= CONFIG.search.levenshteinThreshold) {
      Logger.success("Found good match", {
        similarity: bestSimilarity.toFixed(3),
      });
      return bestMatch ?? null;
    }

    Logger.warn("No match under threshold", {
      similarity: bestSimilarity.toFixed(3),
      threshold: CONFIG.search.levenshteinThreshold,
    });
    return null;
  }
}
