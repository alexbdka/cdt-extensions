import { Logger } from "./logger";
import type { DownloadTarget, ModPage } from "./types";

const CDT_CATEGORY_TO_MOD_MANAGER_GAME_ID: Record<string, string> = {
  fallout3: "fallout3",
  fallout4: "fallout4",
  "fallout-new-vegas": "falloutnv",
  morrowind: "morrowind",
  oblivion: "oblivion",
};

export class URLParser {
  static getCurrentGameCategory(): string {
    return window.location.pathname.split("/")[1] ?? "";
  }

  static getCurrentModPage(): ModPage | null {
    const match = window.location.pathname.match(/^\/([^/]+)\/mods\/([^/?#]+)/);
    if (!match) {
      return null;
    }

    const category = match[1];
    const modId = match[2];
    if (!category || !modId) {
      return null;
    }

    return {
      category: decodeURIComponent(category),
      modId: decodeURIComponent(modId),
    };
  }

  static buildFallbackDownloadUrl(modPage: ModPage): URL {
    const url = new URL(window.location.href);
    url.pathname = `/${modPage.category}/telechargement/${modPage.modId}`;
    url.search = "";
    url.hash = "";
    return url;
  }

  static createDownloadTarget(downloadUrl: URL, modPage: ModPage): DownloadTarget | null {
    const gameId = this.getModManagerGameIdFromDownloadUrl(downloadUrl, modPage);
    if (!gameId) {
      return null;
    }

    return {
      downloadUrl: downloadUrl.toString(),
      gameId,
    };
  }

  static getModManagerGameIdFromDownloadUrl(downloadUrl: URL, modPage: ModPage): string | null {
    if (modPage.category === "skyrim") {
      const path = downloadUrl.pathname.toLowerCase();
      if (
        path.includes("/telechargement-se") ||
        path.includes("/telechargement_se") ||
        path.split("/").includes("sse")
      ) {
        return "skyrimse";
      }
      return "skyrim";
    }

    return this.getDefaultModManagerGameId(modPage.category);
  }

  static getDefaultModManagerGameId(category: string): string | null {
    return CDT_CATEGORY_TO_MOD_MANAGER_GAME_ID[category] ?? null;
  }
}

export class DownloadLinkExtractor {
  extract(): DownloadTarget | null {
    const modPage = URLParser.getCurrentModPage();
    if (!modPage) {
      Logger.error("Current page is not a supported CdT mod page", {
        path: window.location.pathname,
      });
      return null;
    }

    const pageDownloadUrl = this.findDownloadUrl(modPage);
    if (pageDownloadUrl) {
      const target = URLParser.createDownloadTarget(pageDownloadUrl, modPage);
      if (target) {
        Logger.info("Download URL found in page", {
          gameId: target.gameId,
          url: target.downloadUrl,
        });
        return target;
      }
    }

    const fallbackUrl = URLParser.buildFallbackDownloadUrl(modPage);
    const fallbackTarget = URLParser.createDownloadTarget(fallbackUrl, modPage);
    Logger.warn("Download link not found in page, using fallback URL", {
      target: fallbackTarget,
    });
    return fallbackTarget;
  }

  private findDownloadUrl(modPage: ModPage): URL | null {
    const primaryLink = document.querySelector<HTMLAnchorElement>("#downloadLink");
    const primaryUrl = this.tryParseUrl(primaryLink?.href);
    if (primaryUrl && this.isDownloadUrl(primaryUrl, modPage)) {
      return primaryUrl;
    }

    for (const link of Array.from(document.links)) {
      const url = this.tryParseUrl(link.href);
      if (url && this.isDownloadUrl(url, modPage)) {
        return url;
      }
    }

    return null;
  }

  private isDownloadUrl(url: URL, modPage: ModPage): boolean {
    return (
      url.origin === window.location.origin &&
      url.pathname.includes(`/${modPage.category}/`) &&
      url.pathname.includes("/telechargement") &&
      url.pathname.split("/").includes(modPage.modId)
    );
  }

  private tryParseUrl(value?: string): URL | null {
    if (!value) {
      return null;
    }
    try {
      return new URL(value, window.location.href);
    } catch {
      return null;
    }
  }
}
