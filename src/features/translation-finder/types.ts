import type { CdtPosition } from "../../shared/settings";

export type ModInfo = {
  modTitle: string | null;
  uploader: string | null;
  authors: string[];
};

export type TranslationResult = {
  name: string;
  link: string;
};

export type ParsedSearchResults = {
  mods: TranslationResult[];
  source: "empty" | "json" | "html";
};

export type GameConfig = {
  endpoint: string;
  gameParams: Record<string, number>;
};

export type WidgetUiConfig = {
  position: CdtPosition;
  colors: {
    default: string;
    success: string;
    warning: string;
    error: string;
    text: string;
    border: string;
  };
};
