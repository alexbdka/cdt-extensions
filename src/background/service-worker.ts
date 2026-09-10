import { extensionApi, getRuntimeLastError } from "../shared/browser";
import {
  type BackgroundMessage,
  type BackgroundResponse,
  isBackgroundMessage,
} from "../shared/messages";

const DEFAULT_TIMEOUT_MS = 10000;
const ALLOWED_HOST_SUFFIXES = [".confrerie-des-traducteurs.fr", ".confrerie-des-traducteurs.com"];

extensionApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isBackgroundMessage(message)) {
    return undefined;
  }

  switch (message.type) {
    case "cdt:postFormViaTab":
      void handlePostFormViaTab(message, sendResponse);
      return true;
    case "cdt:resolveDownload":
      void handleResolveDownload(message, sendResponse);
      return true;
    case "cdt:openTab":
      void handleOpenTab(message, sendResponse);
      return true;
    case "cdt:closeTab":
      void handleCloseTab(sender, sendResponse);
      return true;
    default:
      return undefined;
  }
});

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function handlePostFormViaTab(
  message: Extract<BackgroundMessage, { type: "cdt:postFormViaTab" }>,
  sendResponse: (response: BackgroundResponse) => void,
): Promise<void> {
  const timeoutMs = Number.isFinite(message.timeoutMs)
    ? (message.timeoutMs as number)
    : DEFAULT_TIMEOUT_MS;

  try {
    const requestUrl = new URL(message.url);
    if (!isAllowedHost(requestUrl.host)) {
      throw new Error("Blocked host");
    }

    const referrer = resolveReferrer(message.referrer);
    const tabId = await createHiddenTab(referrer);

    try {
      await waitForTabComplete(tabId, timeoutMs);
      const response = await runSearchInTab(
        tabId,
        requestUrl.toString(),
        message.body ?? "",
        timeoutMs,
      );
      sendResponse(response);
    } finally {
      await removeTab(tabId);
    }
  } catch (error) {
    sendResponse({ ok: false, error: formatError(error) });
  }
}

function resolveReferrer(referrer: string | undefined): string {
  if (!referrer) {
    return "https://www.confrerie-des-traducteurs.fr/";
  }
  try {
    const url = new URL(referrer);
    if (isAllowedHost(url.host)) {
      return url.toString();
    }
    return "https://www.confrerie-des-traducteurs.fr/";
  } catch {
    return "https://www.confrerie-des-traducteurs.fr/";
  }
}

function isAllowedHost(host: string): boolean {
  if (!host) {
    return false;
  }
  if (host === "www.confrerie-des-traducteurs.fr") {
    return true;
  }
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

async function handleResolveDownload(
  message: Extract<BackgroundMessage, { type: "cdt:resolveDownload" }>,
  sendResponse: (response: BackgroundResponse) => void,
): Promise<void> {
  try {
    const requestUrl = new URL(message.url);
    if (!isAllowedHost(requestUrl.host)) {
      throw new Error("Blocked host");
    }

    const response = await fetchWithFallback(requestUrl.toString());
    if (!response) {
      sendResponse({ ok: false, error: "Unable to resolve" });
      return;
    }

    sendResponse({
      ok: true,
      finalUrl: response.finalUrl,
      contentDisposition: response.contentDisposition,
    });
  } catch (error) {
    sendResponse({ ok: false, error: formatError(error) });
  }
}

async function fetchWithFallback(
  url: string,
): Promise<{ finalUrl: string; contentDisposition: string | null } | null> {
  try {
    let response = await fetch(url, {
      method: "HEAD",
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Range: "bytes=0-0",
        },
        credentials: "omit",
        cache: "no-store",
        redirect: "follow",
      });
    }

    if (!response.ok) {
      return null;
    }

    return {
      finalUrl: response.url,
      contentDisposition: response.headers.get("content-disposition"),
    };
  } catch {
    return null;
  }
}

function createHiddenTab(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    extensionApi.tabs.create({ url, active: false }, (tab) => {
      const error = getRuntimeLastError();
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (!tab?.id) {
        reject(new Error("Failed to create tab"));
        return;
      }
      resolve(tab.id);
    });
  });
}

function waitForTabComplete(tabId: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Tab load timeout"));
    }, timeoutMs);

    const onUpdated = (updatedId: number, info: { status?: string }) => {
      if (updatedId === tabId && info.status === "complete") {
        cleanup();
        resolve();
      }
    };

    const onRemoved = (removedId: number) => {
      if (removedId === tabId) {
        cleanup();
        reject(new Error("Tab closed before load"));
      }
    };

    function cleanup() {
      clearTimeout(timeoutId);
      extensionApi.tabs.onUpdated.removeListener(onUpdated);
      extensionApi.tabs.onRemoved.removeListener(onRemoved);
    }

    extensionApi.tabs.onUpdated.addListener(onUpdated);
    extensionApi.tabs.onRemoved.addListener(onRemoved);
  });
}

function removeTab(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    if (!extensionApi.tabs?.remove) {
      resolve();
      return;
    }
    extensionApi.tabs.remove(tabId, () => resolve());
  });
}

type InjectedSearchResult =
  | {
      ok: true;
      status: number;
      text: string;
      contentType: string | null;
      finalUrl: string;
    }
  | { ok: false; error: string };

async function runSearchInTab(
  tabId: number,
  url: string,
  body: string,
  timeoutMs: number,
): Promise<BackgroundResponse> {
  if (!extensionApi.scripting?.executeScript) {
    throw new Error("Scripting API unavailable");
  }

  const injectionResults = await extensionApi.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-misused-promises
    func: async (...args: any[]): Promise<InjectedSearchResult> => {
      const [requestUrl, requestBody, requestTimeoutMs] = args as [string, string, number];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

      try {
        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json, text/javascript, */*; q=0.01",
          },
          body: requestBody,
          signal: controller.signal,
          credentials: "same-origin",
          cache: "no-store",
        });

        const text = await response.text();
        return {
          ok: true as const,
          status: response.status,
          text,
          contentType: response.headers.get("content-type"),
          finalUrl: response.url,
        };
      } catch (error) {
        const message =
          error instanceof Error && error.name === "AbortError"
            ? "Request timeout"
            : formatError(error);
        return { ok: false, error: message };
      } finally {
        clearTimeout(timeoutId);
      }
    },
    args: [url, body, timeoutMs],
  });

  const result = injectionResults[0]?.result as InjectedSearchResult | undefined;
  if (!result) {
    throw new Error("No result from injected script");
  }

  return result;
}

function handleOpenTab(
  message: Extract<BackgroundMessage, { type: "cdt:openTab" }>,
  sendResponse: (response: BackgroundResponse) => void,
): void {
  if (!message.url) {
    sendResponse({ ok: false, error: "Missing URL" });
    return;
  }

  if (!extensionApi.tabs?.create) {
    sendResponse({ ok: false, error: "Tabs API unavailable" });
    return;
  }

  extensionApi.tabs.create({ url: message.url, active: true }, () => {
    const error = getRuntimeLastError();
    if (error) {
      sendResponse({ ok: false, error: error.message });
      return;
    }
    sendResponse({ ok: true });
  });
}

function handleCloseTab(
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: BackgroundResponse) => void,
): void {
  const tabId = sender.tab?.id;
  if (!tabId || !extensionApi.tabs?.remove) {
    sendResponse({ ok: false, error: "Tab unavailable" });
    return;
  }

  extensionApi.tabs.remove(tabId, () => {
    const error = getRuntimeLastError();
    if (error) {
      sendResponse({ ok: false, error: error.message });
      return;
    }
    sendResponse({ ok: true });
  });
}
