import { onStorageChanged, storageGet } from "../../shared/browser";
import { injectFontFace } from "../../shared/font";
import { DEFAULT_SETTINGS, normalizePosition } from "../../shared/settings";
import { MO2HandlerApp } from "./app";
import { CONFIG } from "./config";
import { Logger } from "./logger";

injectFontFace();

async function bootstrap(): Promise<void> {
  const settings = await storageGet(DEFAULT_SETTINGS);
  CONFIG.debug = settings.debug;
  CONFIG.ui.position = normalizePosition(settings.positionMo2);

  if (!settings.download) {
    return;
  }

  const start = async () => {
    const app = new MO2HandlerApp();
    await app.initialize();

    onStorageChanged((changes, area) => {
      if (area !== "local") {
        return;
      }
      if (changes.debug) {
        CONFIG.debug = Boolean(changes.debug.newValue);
      }
      if (changes.positionMo2) {
        CONFIG.ui.position = normalizePosition(changes.positionMo2.newValue);
        app.uiManager?.applyTheme(CONFIG.ui);
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
  console.error("[CdT-MO2] 🔴 Initialization failed", error);
});
