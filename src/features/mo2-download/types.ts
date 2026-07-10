import type { CdtPosition } from "../../shared/settings";

export type ModPage = {
  category: string;
  modId: string;
};

export type DownloadTarget = {
  downloadUrl: string;
  gameId: string;
};

export type ResolvedDownload = {
  url: string | null;
  fileName: string | null;
};

export type ModManagerTarget = DownloadTarget & {
  fileName: string | null;
  modManagerLink: string;
};

export type WidgetUiConfig = {
  position: CdtPosition;
  colors: {
    primary: string;
    text: string;
    border: string;
  };
};
