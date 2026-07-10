import { sendMessage } from "../../shared/browser";
import type { BackgroundResponse } from "../../shared/messages";
import { Logger } from "./logger";

export type SearchResponse = {
  ok: true;
  status: number;
  text: string;
  contentType: string | null;
  finalUrl: string;
};

export class HTTPClient {
  static makeRequest(
    url: string,
    params: URLSearchParams,
    referrer: string,
  ): Promise<SearchResponse> {
    const query = params.toString();
    Logger.info("Sending search request", { url, query, referrer });
    return sendMessage<BackgroundResponse>({
      type: "cdt:postFormViaTab",
      url,
      body: query,
      referrer,
      timeoutMs: 10000,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(response.error);
      }
      if ("text" in response) {
        return response;
      }
      throw new Error("Unexpected response format");
    });
  }
}
