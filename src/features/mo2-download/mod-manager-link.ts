import { Logger } from "./logger";

export class ModManagerLinkGenerator {
  private gameId: string;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  generate(downloadUrl: string | null, fileName: string | null = null): string | null {
    if (!downloadUrl || !this.gameId) {
      Logger.error("Missing required parameters for link generation");
      return null;
    }

    const encodedUrl = encodeURIComponent(downloadUrl);
    const filenameParameter = fileName ? `&filename=${encodeURIComponent(fileName)}` : "";
    const link = `modl://${this.gameId}/?url=${encodedUrl}${filenameParameter}`;

    Logger.info("Generated mod manager link", { link });
    return link;
  }
}
