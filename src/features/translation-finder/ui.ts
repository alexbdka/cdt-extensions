import {
  WidgetButton,
  applyWidgetTheme,
  loadWidgetContainer,
  mountWidget,
} from "../../shared/content-widget";
import { ASSETS, UI_STATES } from "./config";
import { Logger } from "./logger";
import type { WidgetUiConfig } from "./types";

class TemplateLoader {
  static async load(): Promise<HTMLElement> {
    return loadWidgetContainer(
      ASSETS.templateUrl,
      ".cdt-widget--nexus",
      () => this.createFallback(),
      Logger,
    );
  }

  private static createFallback(): HTMLElement {
    const container = document.createElement("div");
    container.id = "cdt-nexus-root";
    container.className = "cdt-widget cdt-widget--nexus";
    container.dataset.state = "default";
    container.innerHTML = `
      <div class="cdt-widget__drag" title="Déplacer" aria-hidden="true">⋮⋮</div>
      <button class="cdt-widget__button" type="button">
        <img class="cdt-widget__icon" alt="Confrérie des Traducteurs">
        <span class="cdt-widget__label">Traduction<br>française</span>
      </button>
    `;
    return container;
  }
}

export class UIManager {
  container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  static async create(): Promise<UIManager> {
    const existing = document.querySelector<HTMLElement>(".cdt-widget--nexus");
    if (existing) {
      return new UIManager(existing);
    }

    const container = await TemplateLoader.load();
    return new UIManager(container);
  }

  applyTheme(uiConfig: WidgetUiConfig): void {
    applyWidgetTheme(this.container, {
      position: uiConfig.position,
      variables: {
        "--cdt-widget-bg": uiConfig.colors.default,
        "--cdt-widget-success": uiConfig.colors.success,
        "--cdt-widget-warning": uiConfig.colors.warning,
        "--cdt-widget-error": uiConfig.colors.error,
        "--cdt-widget-text": uiConfig.colors.text,
        "--cdt-widget-border": uiConfig.colors.border,
      },
    });
  }

  mount(): void {
    mountWidget(this.container);
  }
}

export class ButtonComponent extends WidgetButton {
  initialize(iconUrl: string): void {
    super.initialize(iconUrl);
    this.setState("default");
  }

  setState(stateName: keyof typeof UI_STATES): void {
    const state = UI_STATES[stateName] || UI_STATES.default;
    this.container.dataset.state = stateName;
    this.button.disabled = state.disabled;
    this.setLabel(state.label);
  }
}
