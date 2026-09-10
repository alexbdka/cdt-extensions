import {
  WidgetButton,
  applyWidgetTheme,
  loadWidgetContainer,
  mountWidget,
} from "../../shared/content-widget";
import { ASSETS } from "./config";
import { Logger } from "./logger";
import type { WidgetUiConfig } from "./types";

class TemplateLoader {
  static async load(): Promise<HTMLElement> {
    return loadWidgetContainer(
      ASSETS.templateUrl,
      ".cdt-widget--mo2",
      () => this.createFallback(),
      Logger,
    );
  }

  private static createFallback(): HTMLElement {
    const container = document.createElement("div");
    container.id = "cdt-mo2-root";
    container.className = "cdt-widget cdt-widget--mo2";
    container.dataset.state = "default";
    container.innerHTML = `
      <div class="cdt-widget__drag" title="Déplacer" aria-hidden="true">⋮⋮</div>
      <button class="cdt-widget__button" type="button">
        <img class="cdt-widget__icon" alt="Confrérie des Traducteurs">
        <span class="cdt-widget__label">Télécharger<br>avec<br>MO2</span>
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
    const existing = document.querySelector<HTMLElement>(".cdt-widget--mo2");
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
        "--cdt-widget-bg": uiConfig.colors.primary,
        "--cdt-widget-text": uiConfig.colors.text,
        "--cdt-widget-border": uiConfig.colors.border,
      },
    });
  }

  mount(): void {
    mountWidget(this.container);
  }
}

export class ButtonComponent extends WidgetButton {}
