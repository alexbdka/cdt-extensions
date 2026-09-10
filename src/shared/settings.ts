export type CdtPosition = {
  bottom: number;
  right: number;
};

export type CdtSettingsValues = {
  redirect: boolean;
  download: boolean;
  debug: boolean;
  levenshteinThreshold: number;
  strategies: string[];
  positionNexus: CdtPosition;
  positionMo2: CdtPosition;
};

export const DEFAULT_POSITION: CdtPosition = { bottom: 20, right: 20 };

export const DEFAULT_SETTINGS: CdtSettingsValues = {
  redirect: false,
  download: false,
  debug: false,
  levenshteinThreshold: 0.3,
  strategies: ["authors", "uploader", "title"],
  positionNexus: { ...DEFAULT_POSITION },
  positionMo2: { ...DEFAULT_POSITION },
};

export const STRATEGY_ORDER = ["authors", "uploader", "title"];

export const STRATEGY_LABELS: Record<string, string> = {
  authors: "Auteurs",
  uploader: "Uploader",
  title: "Titre",
};

export const WIDGET_THEME = {
  primary: "#b4975a",
  text: "#1a1a1a",
  border: "#8a6f3b",
  success: "#5cb85c",
  warning: "#f0ad4e",
  error: "#d9534f",
};

export function normalizeStrategies(strategies: unknown): string[] {
  if (!Array.isArray(strategies)) {
    return [...STRATEGY_ORDER];
  }

  const allowed = new Set(STRATEGY_ORDER);
  const normalized = strategies.filter(
    (strategy): strategy is string => typeof strategy === "string" && allowed.has(strategy),
  );
  return normalized.length ? normalized : [...STRATEGY_ORDER];
}

export function normalizePosition(position: unknown): CdtPosition {
  if (!position || typeof position !== "object") {
    return { ...DEFAULT_POSITION };
  }

  const rawPosition = position as Partial<CdtPosition>;
  const bottom = Number(rawPosition.bottom);
  const right = Number(rawPosition.right);

  return {
    bottom: Number.isFinite(bottom) ? Math.max(0, bottom) : DEFAULT_POSITION.bottom,
    right: Number.isFinite(right) ? Math.max(0, right) : DEFAULT_POSITION.right,
  };
}

export function clampThreshold(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_SETTINGS.levenshteinThreshold;
  }
  return Math.min(0.8, Math.max(0.1, numeric));
}
