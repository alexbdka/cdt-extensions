import { storageSet } from "../../shared/browser";
import { normalizePosition } from "../../shared/settings";
import { enableWidgetDrag } from "../../shared/widget-drag";
import { ASSETS, CONFIG } from "./config";
import { DownloadLinkExtractor, URLParser } from "./cdt-download";
import { DownloadUrlResolver } from "./download-url-resolver";
import { Logger } from "./logger";
import { ModManagerLinkGenerator } from "./mod-manager-link";
import type { DownloadTarget, ModManagerTarget } from "./types";
import { ButtonComponent, UIManager } from "./ui";

export class MO2HandlerApp {
  gameCategory: string;
  uiManager: UIManager | null;
  button: ButtonComponent | null;
  modManagerTarget: ModManagerTarget | null;
  dragCleanup: (() => void) | null;

  constructor() {
    this.gameCategory = URLParser.getCurrentGameCategory();
    this.uiManager = null;
    this.button = null;
    this.modManagerTarget = null;
    this.dragCleanup = null;
  }

  async initialize(): Promise<void> {
    Logger.info("Initializing MO2 Handler", {
      gameCategory: this.gameCategory,
    });

    const downloadTarget = this.extractDownloadTarget();
    if (!downloadTarget) {
      Logger.error("Failed to extract download URL");
      return;
    }

    this.modManagerTarget = await this.buildModManagerTarget(downloadTarget);
    if (!this.modManagerTarget) {
      Logger.error("Failed to generate mod manager link");
      return;
    }

    await this.setupUI();
    Logger.success("Application initialized successfully");
  }

  private extractDownloadTarget(): DownloadTarget | null {
    const extractor = new DownloadLinkExtractor();
    return extractor.extract();
  }

  private async buildModManagerTarget(target: DownloadTarget): Promise<ModManagerTarget | null> {
    const resolved = await DownloadUrlResolver.resolve(target.downloadUrl);
    const generator = new ModManagerLinkGenerator(target.gameId);
    const modManagerLink = generator.generate(resolved.url, resolved.fileName);

    if (!modManagerLink) {
      return null;
    }

    if (resolved.fileName) {
      Logger.info("Resolved filename", {
        gameId: target.gameId,
        fileName: resolved.fileName,
      });
    }

    return {
      ...target,
      downloadUrl: resolved.url ?? target.downloadUrl,
      fileName: resolved.fileName,
      modManagerLink,
    };
  }

  private async setupUI(): Promise<void> {
    this.uiManager = await UIManager.create();
    this.uiManager.applyTheme(CONFIG.ui);
    this.button = new ButtonComponent(this.uiManager.container, () => this.handleDownload());
    this.button.initialize(ASSETS.iconUrl);
    this.button.setDisabled(!this.modManagerTarget);
    this.uiManager.mount();

    this.dragCleanup = enableWidgetDrag(this.uiManager.container, {
      handleSelector: ".cdt-widget__drag",
      onDragEnd: (position) => {
        void this.savePosition(position);
      },
    });
  }

  private handleDownload(): void {
    if (!this.modManagerTarget) {
      return;
    }

    try {
      const popup = window.open(this.modManagerTarget.modManagerLink, "_blank");
      if (popup) {
        setTimeout(() => {
          try {
            popup.close();
          } catch {
            // Ignore close failures (browser may block programmatic close).
          }
        }, 800);
      }
      Logger.success("Download initiated via MO2", {
        gameId: this.modManagerTarget.gameId,
        downloadUrl: this.modManagerTarget.downloadUrl,
      });
    } catch (error) {
      Logger.error("Failed to initiate download", error);
    }
  }

  private async savePosition(position: { bottom: number; right: number }): Promise<void> {
    CONFIG.ui.position = normalizePosition(position);
    await storageSet({ positionMo2: CONFIG.ui.position });
  }
}
