import { type BackgroundMessage, type BackgroundResponse } from "./messages";

const hasBrowserApi = typeof browser !== "undefined";

export const extensionApi = hasBrowserApi
  ? browser
  : ((globalThis as typeof globalThis & { chrome?: typeof chrome }).chrome ??
    ({} as typeof chrome));

export function runtimeUrl(path: string): string {
  return extensionApi.runtime.getURL(path);
}

export function storageGet<T extends object>(defaults: T): Promise<T> {
  const storage = extensionApi.storage.local;
  if (hasBrowserApi) {
    return storage.get(defaults) as Promise<T>;
  }
  return new Promise((resolve) => storage.get(defaults, (value) => resolve(value as T)));
}

export function storageSet(values: object): Promise<void> {
  const storage = extensionApi.storage.local;
  if (hasBrowserApi) {
    return storage.set(values);
  }
  return new Promise((resolve) => storage.set(values, () => resolve()));
}

export function sendMessage<T extends BackgroundResponse>(message: BackgroundMessage): Promise<T> {
  if (hasBrowserApi) {
    return extensionApi.runtime.sendMessage(message) as Promise<T>;
  }
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, {}, (response: T) => {
      const error = getRuntimeLastError();
      if (error) {
        reject(error);
        return;
      }
      resolve(response);
    });
  });
}

export function onStorageChanged(
  listener: (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void,
): void {
  extensionApi.storage.onChanged.addListener(listener);
}

export function getRuntimeLastError(): Error | undefined {
  return (
    extensionApi.runtime as typeof extensionApi.runtime & {
      lastError?: Error;
    }
  ).lastError;
}
