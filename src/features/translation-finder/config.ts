import { runtimeUrl } from "../../shared/browser";
import {
  DEFAULT_SETTINGS,
  STRATEGY_ORDER,
  WIDGET_THEME,
  normalizePosition,
} from "../../shared/settings";

export const ASSETS = {
  templateUrl: runtimeUrl("templates/translation-finder.html"),
  iconUrl: runtimeUrl("assets/icons/logo_128.png"),
};

export const UI_STATES = {
  default: { label: "Traduction<br>française", disabled: false },
  loading: { label: "Recherche...", disabled: true },
  success: { label: "Traduction<br>trouvée", disabled: false },
  notFound: { label: "Pas de traduction<br>trouvée", disabled: false },
  error: { label: "Erreur", disabled: false },
};

export const CONFIG = {
  debug: DEFAULT_SETTINGS.debug,
  search: {
    levenshteinThreshold: DEFAULT_SETTINGS.levenshteinThreshold,
    strategies: [...STRATEGY_ORDER],
    authorSeparators: ["-", ",", " and ", "&", "+"],
  },
  ui: {
    position: normalizePosition(DEFAULT_SETTINGS.positionNexus),
    colors: {
      default: WIDGET_THEME.primary,
      success: WIDGET_THEME.success,
      warning: WIDGET_THEME.warning,
      error: WIDGET_THEME.error,
      text: WIDGET_THEME.text,
      border: WIDGET_THEME.border,
    },
  },
  selectors: {
    modTitle: "#pagetitle > h1, .modpage-title h1, h1[itemprop='name']",
    uploader: "#fileinfo a[href*='/users/'], .file-uploader a, a[rel='author']",
  },
  endpoints: {
    skyrim: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
    skyrimspecialedition: "https://www.confrerie-des-traducteurs.fr/skyrim/api/recherche/simple",
    oblivion: "https://www.confrerie-des-traducteurs.fr/oblivion/api/recherche/simple",
    morrowind: "https://www.confrerie-des-traducteurs.fr/morrowind/api/recherche/simple",
    fallout4: "https://www.confrerie-des-traducteurs.fr/fallout4/api/recherche/simple",
    newvegas: "https://www.confrerie-des-traducteurs.fr/fallout-new-vegas/api/recherche/simple",
    fallout3: "https://www.confrerie-des-traducteurs.fr/fallout3/api/recherche/simple",
  } as Record<string, string>,
};
