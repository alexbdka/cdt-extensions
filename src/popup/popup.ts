import { storageGet, storageSet } from "../shared/browser";
import {
  DEFAULT_SETTINGS,
  STRATEGY_LABELS,
  clampThreshold,
  normalizePosition,
  normalizeStrategies,
} from "../shared/settings";

function getElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing popup element: ${id}`);
  }
  return element as T;
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
document.addEventListener("DOMContentLoaded", async () => {
  const redirectToggle = getElementById<HTMLInputElement>("redirectToggle");
  const downloadToggle = getElementById<HTMLInputElement>("downloadToggle");
  const debugToggle = getElementById<HTMLInputElement>("debugToggle");
  const thresholdRange = getElementById<HTMLInputElement>("thresholdRange");
  const thresholdValue = getElementById("thresholdValue");
  const strategyList = getElementById("strategyList");
  const resetDefaults = getElementById("resetDefaults");
  const resetPositions = getElementById("resetPositions");
  const settingsToggleGlobal = getElementById("settingsToggleGlobal");
  const settingsToggleNexus = getElementById("settingsToggleNexus");
  const settingsToggleMo2 = getElementById("settingsToggleMo2");
  const settingsPanelGlobal = getElementById("settingsPanelGlobal");
  const settingsPanelNexus = getElementById("settingsPanelNexus");
  const settingsPanelMo2 = getElementById("settingsPanelMo2");
  const status = getElementById("status");

  const saved = await storageGet(DEFAULT_SETTINGS);
  const state = {
    redirect: saved.redirect ?? DEFAULT_SETTINGS.redirect,
    download: saved.download ?? DEFAULT_SETTINGS.download,
    debug: saved.debug ?? DEFAULT_SETTINGS.debug,
    levenshteinThreshold: clampThreshold(saved.levenshteinThreshold),
    strategies: normalizeStrategies(saved.strategies),
    positionNexus: normalizePosition(saved.positionNexus),
    positionMo2: normalizePosition(saved.positionMo2),
  };

  let statusTimer: ReturnType<typeof setTimeout> | null = null;
  let draggingItem: HTMLElement | null = null;

  function setStatus(message: string): void {
    status.textContent = message;
    if (statusTimer) {
      clearTimeout(statusTimer);
    }
    statusTimer = setTimeout(() => {
      status.textContent = "";
    }, 1500);
  }

  async function saveState() {
    await storageSet({
      redirect: state.redirect,
      download: state.download,
      debug: state.debug,
      levenshteinThreshold: state.levenshteinThreshold,
      strategies: state.strategies,
      positionNexus: state.positionNexus,
      positionMo2: state.positionMo2,
    });
    setStatus("Paramètres sauvegardés");
  }

  function updateThresholdDisplay() {
    thresholdValue.textContent = state.levenshteinThreshold.toFixed(2);
  }

  function buildStrategyList() {
    strategyList.innerHTML = "";
    state.strategies.forEach((strategy) => {
      const item = document.createElement("li");
      item.className = "strategy-item";
      item.draggable = true;
      item.dataset.strategy = strategy;

      const label = document.createElement("span");
      label.textContent = STRATEGY_LABELS[strategy] || strategy;

      const handle = document.createElement("span");
      handle.className = "drag-handle";
      handle.textContent = "⋮⋮";

      item.append(label, handle);

      item.addEventListener("dragstart", (event) => {
        draggingItem = item;
        item.classList.add("dragging");
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", strategy);
        }
      });

      item.addEventListener("dragend", () => {
        if (draggingItem) {
          draggingItem.classList.remove("dragging");
          draggingItem = null;
        }
        saveStrategiesFromDom();
      });

      strategyList.appendChild(item);
    });
  }

  function saveStrategiesFromDom() {
    state.strategies = Array.from(strategyList.querySelectorAll<HTMLElement>(".strategy-item"))
      .map((item) => item.dataset.strategy)
      .filter((strategy): strategy is string => Boolean(strategy));
    void saveState();
  }

  function updateUI() {
    redirectToggle.checked = state.redirect;
    downloadToggle.checked = state.download;
    debugToggle.checked = state.debug;
    thresholdRange.value = state.levenshteinThreshold.toFixed(2);
    updateThresholdDisplay();
    buildStrategyList();
  }

  strategyList.addEventListener("dragover", (event) => {
    event.preventDefault();
    const target = event.target instanceof Element ? event.target.closest(".strategy-item") : null;
    if (!target || target === draggingItem) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const shouldInsertAfter = event.clientY - rect.top > rect.height / 2;
    if (draggingItem) {
      strategyList.insertBefore(draggingItem, shouldInsertAfter ? target.nextSibling : target);
    }
  });

  redirectToggle.addEventListener("change", () => {
    state.redirect = redirectToggle.checked;
    void saveState();
  });

  downloadToggle.addEventListener("change", () => {
    state.download = downloadToggle.checked;
    void saveState();
  });

  debugToggle.addEventListener("change", () => {
    state.debug = debugToggle.checked;
    void saveState();
  });

  thresholdRange.addEventListener("input", () => {
    state.levenshteinThreshold = clampThreshold(thresholdRange.value);
    updateThresholdDisplay();
  });

  thresholdRange.addEventListener("change", () => {
    state.levenshteinThreshold = clampThreshold(thresholdRange.value);
    void saveState();
  });

  function togglePanel(toggleButton: HTMLElement, panel: HTMLElement): void {
    if (!toggleButton || !panel) {
      return;
    }
    const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
    const nextState = String(!isExpanded);
    toggleButton.setAttribute("aria-expanded", nextState);
    panel.hidden = isExpanded;
  }

  settingsToggleGlobal.addEventListener("click", () =>
    togglePanel(settingsToggleGlobal, settingsPanelGlobal),
  );
  settingsToggleNexus.addEventListener("click", () =>
    togglePanel(settingsToggleNexus, settingsPanelNexus),
  );
  settingsToggleMo2.addEventListener("click", () =>
    togglePanel(settingsToggleMo2, settingsPanelMo2),
  );

  resetDefaults.addEventListener("click", () => {
    Object.assign(state, {
      levenshteinThreshold: DEFAULT_SETTINGS.levenshteinThreshold,
      strategies: [...DEFAULT_SETTINGS.strategies],
    });
    updateUI();
    void saveState();
  });

  resetPositions.addEventListener("click", () => {
    state.positionNexus = normalizePosition(DEFAULT_SETTINGS.positionNexus);
    state.positionMo2 = normalizePosition(DEFAULT_SETTINGS.positionMo2);
    void saveState();
  });

  updateUI();
});
