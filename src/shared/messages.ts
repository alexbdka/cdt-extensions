export type BackgroundResponse =
  | { ok: true }
  | { ok: false; error: string }
  | { ok: true; finalUrl: string; contentDisposition: string | null }
  | {
      ok: true;
      status: number;
      text: string;
      contentType: string | null;
      finalUrl: string;
    }
  | { ok: false; error: string; status?: number };

export type BackgroundMessage =
  | {
      type: "cdt:postFormViaTab";
      url: string;
      body?: string;
      referrer?: string;
      timeoutMs?: number;
    }
  | { type: "cdt:resolveDownload"; url: string }
  | { type: "cdt:openTab"; url: string }
  | { type: "cdt:closeTab" };

export function isBackgroundMessage(value: unknown): value is BackgroundMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const message = value as { type: unknown };
  if (typeof message.type !== "string") {
    return false;
  }

  return ["cdt:postFormViaTab", "cdt:resolveDownload", "cdt:openTab", "cdt:closeTab"].includes(
    message.type,
  );
}
