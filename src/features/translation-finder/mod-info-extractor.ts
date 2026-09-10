import { CONFIG } from "./config";
import { Logger } from "./logger";
import type { ModInfo } from "./types";

export class ModInfoExtractor {
  static extract(): ModInfo {
    const modTitle = this.extractElement(CONFIG.selectors.modTitle);
    const uploader = this.extractElement(CONFIG.selectors.uploader);
    const authors = this.extractAuthors();

    const info = { modTitle, uploader, authors };
    Logger.info("Extracted mod information", info);

    if (!modTitle && !uploader && !authors.length) {
      Logger.warn("No mod information found - selectors may be outdated");
    }

    return info;
  }

  private static extractElement(selector: string): string | null {
    const selectors = selector.split(",").map((item) => item.trim());

    for (const currentSelector of selectors) {
      const element = document.querySelector<HTMLElement>(currentSelector);
      if (element?.innerText?.trim()) {
        return element.innerText.trim();
      }
    }

    return null;
  }

  private static extractAuthors(): string[] {
    const sideItems = document.querySelectorAll<HTMLElement>(".sideitem");

    for (const item of Array.from(sideItems)) {
      const heading = item.querySelector<HTMLElement>("h3");
      const headerText = heading?.textContent?.trim().toLowerCase();

      if (headerText === "created by" || headerText === "author" || headerText === "authors") {
        const authorsText = (item.textContent || "").replace(heading?.textContent || "", "").trim();
        return this.parseAuthorsText(authorsText);
      }
    }

    return [];
  }

  private static parseAuthorsText(authorsText: string): string[] {
    return CONFIG.search.authorSeparators
      .reduce(
        (authors, separator) => authors.flatMap((author) => author.split(separator)),
        [authorsText],
      )
      .map((author) => author.trim())
      .filter((author) => author.length > 0);
  }
}
