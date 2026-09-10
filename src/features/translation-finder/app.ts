import { storageSet } from "../../shared/browser";
import { normalizePosition } from "../../shared/settings";
import { enableWidgetDrag } from "../../shared/widget-drag";
import { ASSETS, CONFIG } from "./config";
import { GameConfigResolver } from "./game-config-resolver";
import { Logger } from "./logger";
import { ModInfoExtractor } from "./mod-info-extractor";
import { openTab } from "./open-tab";
import { TranslationSearchService } from "./translation-search-service";
import type { GameConfig, TranslationResult } from "./types";
import { ButtonComponent, UIManager } from "./ui";

export class TranslationFinderApp {
  gameCategory: string;
  gameConfig: GameConfig;
  searchService: TranslationSearchService;
  uiManager: UIManager | null;
  button: ButtonComponent | null;
  dragCleanup: (() => void) | null;

  constructor() {
    this.gameCategory = window.location.pathname.split("/")[1] ?? "";
    this.gameConfig = GameConfigResolver.resolve(this.gameCategory);
    this.searchService = new TranslationSearchService(this.gameConfig);
    this.uiManager = null;
    this.button = null;
    this.dragCleanup = null;
  }

  async initialize(): Promise<void> {
    Logger.info("Initializing Translation Finder", {
      gameCategory: this.gameCategory,
    });

    this.uiManager = await UIManager.create();
    this.uiManager.applyTheme(CONFIG.ui);

    this.button = new ButtonComponent(this.uiManager.container, () => this.handleSearch());
    this.button.initialize(ASSETS.iconUrl);
    this.uiManager.mount();

    this.dragCleanup = enableWidgetDrag(this.uiManager.container, {
      handleSelector: ".cdt-widget__drag",
      onDragEnd: (position) => {
        void this.savePosition(position);
      },
    });

    Logger.success("Application initialized successfully");
  }

  private async handleSearch(): Promise<void> {
    if (!this.button) {
      return;
    }

    try {
      this.button.setState("loading");

      const modInfo = ModInfoExtractor.extract();

      if (!modInfo.modTitle && !modInfo.uploader && !modInfo.authors.length) {
        throw new Error("Unable to extract mod information");
      }

      const result = await this.searchService.search(modInfo);

      if (result) {
        this.openTranslationPage(result);
        this.button.setState("success");
        setTimeout(() => this.button?.setState("default"), 3000);
      } else {
        this.button.setState("notFound");
        setTimeout(() => this.button?.setState("default"), 3000);
      }
    } catch (error) {
      Logger.error("Search operation failed", error);
      this.button.setState("error");
      setTimeout(() => this.button?.setState("default"), 3000);
    }
  }

  private openTranslationPage(result: TranslationResult): void {
    const url = result.link?.startsWith("http")
      ? result.link
      : `https://www.confrerie-des-traducteurs.fr${result.link}`;
    Logger.success("Opening translation page", { url });
    openTab(url).catch((error) => {
      Logger.error("Failed to open tab via background, falling back", error);
      window.open(url, "_blank");
    });
  }

  private async savePosition(position: { bottom: number; right: number }): Promise<void> {
    CONFIG.ui.position = normalizePosition(position);
    await storageSet({ positionNexus: CONFIG.ui.position });
  }
}
