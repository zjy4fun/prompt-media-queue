import type { EmbedConfig, Platform, SearchInput, UnifiedMediaItem } from "@prompt-media-queue/shared";

export type PlatformConnector = {
  platform: Platform;
  search(input: SearchInput): Promise<UnifiedMediaItem[]>;
  resolveUrl(url: string): Promise<UnifiedMediaItem | null>;
  getEmbedConfig(item: UnifiedMediaItem): EmbedConfig | null;
};
