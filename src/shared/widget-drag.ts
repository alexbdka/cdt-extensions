import type { CdtPosition } from "./settings";

export type DragOptions = {
  handleSelector?: string;
  threshold?: number;
  onDragEnd?: (position: CdtPosition) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function enableWidgetDrag(container: HTMLElement, options: DragOptions = {}): () => void {
  let startX = 0;
  let startY = 0;
  let startBottom = 0;
  let startRight = 0;
  let rect: DOMRect | null = null;
  let dragging = false;
  let moved = false;
  let lastPosition: CdtPosition | null = null;
  const handle = resolveHandle(container, options);
  const threshold = options.threshold ?? 4;

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    rect = container.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    startBottom = window.innerHeight - rect.bottom;
    startRight = window.innerWidth - rect.right;
    dragging = true;
    moved = false;
    lastPosition = null;

    if (handle.setPointerCapture) {
      handle.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event: PointerEvent): void {
    if (!dragging || !rect) {
      return;
    }

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (!moved && Math.hypot(dx, dy) < threshold) {
      return;
    }

    moved = true;

    const maxRight = Math.max(0, window.innerWidth - rect.width);
    const maxBottom = Math.max(0, window.innerHeight - rect.height);
    const nextRight = clamp(startRight - dx, 0, maxRight);
    const nextBottom = clamp(startBottom - dy, 0, maxBottom);

    container.style.setProperty("--cdt-right", `${nextRight}px`);
    container.style.setProperty("--cdt-bottom", `${nextBottom}px`);

    lastPosition = { bottom: nextBottom, right: nextRight };
  }

  function onPointerUp(event: PointerEvent): void {
    if (!dragging) {
      return;
    }

    dragging = false;

    if (handle.releasePointerCapture) {
      handle.releasePointerCapture(event.pointerId);
    }

    if (moved && lastPosition) {
      container.dataset.cdtDragging = "true";
      setTimeout(() => {
        delete container.dataset.cdtDragging;
      }, 0);

      options.onDragEnd?.(lastPosition);
    }

    rect = null;
  }

  handle.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  return () => {
    handle.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };
}

function resolveHandle(container: HTMLElement, options: DragOptions): HTMLElement {
  if (options.handleSelector) {
    const handle = container.querySelector<HTMLElement>(options.handleSelector);
    if (handle) {
      return handle;
    }
  }
  return container;
}
