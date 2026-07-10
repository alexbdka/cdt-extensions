import { runtimeUrl } from "../../shared/browser";
import { DEFAULT_SETTINGS, WIDGET_THEME, normalizePosition } from "../../shared/settings";

export const ASSETS = {
  templateUrl: runtimeUrl("templates/mo2-download.html"),
  iconUrl: runtimeUrl("assets/icons/logo_128.png"),
};

export const CONFIG = {
  debug: DEFAULT_SETTINGS.debug,
  ui: {
    position: normalizePosition(DEFAULT_SETTINGS.positionMo2),
    colors: {
      primary: WIDGET_THEME.primary,
      text: WIDGET_THEME.text,
      border: WIDGET_THEME.border,
    },
  },
  cdtCategoryToModManagerGameId: {
    fallout3: "fallout3",
    fallout4: "fallout4",
    "fallout-new-vegas": "falloutnv",
    morrowind: "morrowind",
    oblivion: "oblivion",
  } as Record<string, string>,
};
