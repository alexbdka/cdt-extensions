import { onStorageChanged, storageGet } from "../../shared/browser";
import { injectFontFace } from "../../shared/font";
import {
  DEFAULT_SETTINGS,
  clampThreshold,
  normalizePosition,
  normalizeStrategies,
} from "../../shared/settings";
import { TranslationFinderApp } from "./app";
import { CONFIG } from "./config";
import { Logger } from "./logger";

injectFontFace();

async function bootstrap(): Promise<void> {
  const settings = await storageGet(DEFAULT_SETTINGS);
  CONFIG.debug = settings.debug;
  CONFIG.search.levenshteinThreshold = clampThreshold(settings.levenshteinThreshold);
  CONFIG.search.strategies = normalizeStrategies(settings.strategies);
  CONFIG.ui.position = normalizePosition(settings.positionNexus);

  if (!settings.redirect) {
    return;
  }

  const start = async () => {
    const app = new TranslationFinderApp();
    await app.initialize();

    onStorageChanged((changes, area) => {
      if (area !== "local") {
        return;
      }
      if (changes.debug) {
        CONFIG.debug = Boolean(changes.debug.newValue);
      }
      if (changes.positionNexus) {
        CONFIG.ui.position = normalizePosition(changes.positionNexus.newValue);
        app.uiManager?.applyTheme(CONFIG.ui);
      }
      if (changes.levenshteinThreshold) {
        CONFIG.search.levenshteinThreshold = clampThreshold(changes.levenshteinThreshold.newValue);
      }
      if (changes.strategies) {
        CONFIG.search.strategies = normalizeStrategies(changes.strategies.newValue);
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        start().catch((error) => Logger.error("Initialization failed", error));
      },
      { once: true },
    );
  } else {
    await start();
  }
}

bootstrap().catch((error) => {
  console.error("[Nexus-CdT] 🔴 Initialization failed", error);
});
