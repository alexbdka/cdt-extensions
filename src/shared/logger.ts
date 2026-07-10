type LogLevel = "info" | "warn" | "error" | "success";

export type CdtLogger = {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  success(message: string, data?: unknown): void;
};

export function createLogger(prefix: string, getDebug?: () => boolean): CdtLogger {
  const emoji: Record<LogLevel, string> = {
    info: "📘",
    warn: "⚠️",
    error: "🔴",
    success: "✅",
  };

  function log(level: LogLevel, message: string, data?: unknown): void {
    if (typeof getDebug === "function" && !getDebug()) {
      return;
    }

    const output = `${prefix} ${emoji[level]} ${message}`;
    if (level === "warn") {
      console.warn(output, data ?? "");
      return;
    }
    if (level === "error") {
      console.error(output, data ?? "");
      return;
    }
    console.log(output, data ?? "");
  }

  return {
    info: (message, data) => log("info", message, data),
    warn: (message, data) => log("warn", message, data),
    error: (message, data) => log("error", message, data),
    success: (message, data) => log("success", message, data),
  };
}
