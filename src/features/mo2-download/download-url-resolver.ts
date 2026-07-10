import { sendMessage } from "../../shared/browser";
import { Logger } from "./logger";
import type { ResolvedDownload } from "./types";

type ResolveDownloadResponse = {
  ok: true;
  finalUrl: string;
  contentDisposition: string | null;
};

export class DownloadUrlResolver {
  static async resolve(downloadUrl: string | null): Promise<ResolvedDownload> {
    if (!downloadUrl) {
      return { url: null, fileName: null };
    }

    const response = await this.resolveViaBackground(downloadUrl);

    const fileName = this.extractFileName(response.contentDisposition, response.finalUrl);
    const finalUrl = response.finalUrl || downloadUrl;

    if (finalUrl !== downloadUrl) {
      Logger.info("Resolved download URL", {
        from: downloadUrl,
        to: finalUrl,
      });
    }

    return { url: finalUrl, fileName };
  }

  private static async resolveViaBackground(url: string): Promise<ResolveDownloadResponse> {
    const response = await sendMessage<ResolveDownloadResponse>({
      type: "cdt:resolveDownload",
      url,
    });
    if (!response.ok) {
      throw new Error("Failed to resolve download URL");
    }
    return response;
  }

  private static extractFileName(
    contentDisposition: string | null,
    finalUrl: string | null,
  ): string | null {
    if (contentDisposition) {
      const filenameStar = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
      if (filenameStar?.[1]) {
        try {
          return decodeURIComponent(filenameStar[1]);
        } catch {
          return filenameStar[1];
        }
      }

      const filenameMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
      if (filenameMatch?.[1]) {
        return filenameMatch[1];
      }
    }

    if (finalUrl) {
      try {
        const url = new URL(finalUrl);
        const lastSegment = url.pathname.split("/").filter(Boolean).pop();
        if (lastSegment && lastSegment.includes(".")) {
          return decodeURIComponent(lastSegment);
        }
      } catch {
        return null;
      }
    }

    return null;
  }
}
