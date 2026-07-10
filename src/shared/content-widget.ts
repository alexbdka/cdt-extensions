import type { CdtPosition } from "./settings";

export type WidgetLogger = {
  warn(message: string, data?: unknown): void;
};

export type WidgetThemeConfig = {
  position:
    | CdtPosition
    | {
        bottom: number | string;
        right: number | string;
      };
  variables: Record<string, string>;
};

export async function loadWidgetContainer(
  templateUrl: string,
  rootSelector: string,
  createFallback: () => HTMLElement,
  logger: WidgetLogger,
): Promise<HTMLElement> {
  try {
    const response = await fetch(templateUrl);
    if (!response.ok) {
      throw new Error("Failed to load template");
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const container = doc.querySelector<HTMLElement>(rootSelector);

    if (!container) {
      throw new Error("Template missing root container");
    }

    return document.importNode(container, true);
  } catch (error) {
    logger.warn("Template load failed, using fallback", error);
    return createFallback();
  }
}

export function applyWidgetTheme(container: HTMLElement, theme: WidgetThemeConfig): void {
  const bottom =
    typeof theme.position.bottom === "number"
      ? `${theme.position.bottom}px`
      : theme.position.bottom;
  const right =
    typeof theme.position.right === "number" ? `${theme.position.right}px` : theme.position.right;

  container.style.setProperty("--cdt-bottom", bottom);
  container.style.setProperty("--cdt-right", right);

  for (const [name, value] of Object.entries(theme.variables)) {
    container.style.setProperty(name, value);
  }
}

export function mountWidget(container: HTMLElement): void {
  if (!container.isConnected) {
    document.body.appendChild(container);
  }
}

export class WidgetButton {
  protected container: HTMLElement;
  protected button: HTMLButtonElement;
  protected label: HTMLElement;
  protected icon: HTMLImageElement;
  protected onClick: () => Promise<void> | void;

  constructor(container: HTMLElement, onClick: () => Promise<void> | void) {
    this.container = container;
    this.button = this.requireElement(".cdt-widget__button");
    this.label = this.requireElement(".cdt-widget__label");
    this.icon = this.requireElement(".cdt-widget__icon");
    this.onClick = onClick;

    this.button.addEventListener("click", () => {
      void this.handleClick();
    });
  }

  initialize(iconUrl: string): void {
    this.icon.src = iconUrl;
  }

  setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }

  protected setLabel(html: string): void {
    this.label.innerHTML = html;
  }

  private requireElement<T extends HTMLElement>(selector: string): T {
    const element = this.container.querySelector<T>(selector);
    if (!element) {
      throw new Error("Button template is incomplete");
    }
    return element;
  }

  private async handleClick(): Promise<void> {
    if (this.button.disabled) {
      return;
    }
    if (this.container.dataset.cdtDragging === "true") {
      return;
    }

    await this.onClick();
  }
}
