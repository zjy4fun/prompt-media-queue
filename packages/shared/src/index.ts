export type Platform = "youtube" | "bilibili";

export type ContentType = "video" | "audio" | "playlist" | "podcast";

export type PlayableMode = "embed" | "external" | "preview";

export type AggregateMode = "music" | "video" | "mixed";

export type SearchInput = {
  prompt: string;
  query: string;
  mode: AggregateMode;
  limit: number;
};

export type EmbedConfig = {
  provider: Platform;
  src: string;
  title: string;
  allow: string;
};

export type UnifiedMediaItem = {
  id: string;
  platform: Platform;
  externalId: string;
  title: string;
  creator: string;
  thumbnailUrl?: string;
  durationSec?: number;
  url: string;
  embedUrl?: string;
  contentType: ContentType;
  playableMode: PlayableMode;
  score: number;
  reason: string;
};

export type QueueItem = UnifiedMediaItem & {
  queuePosition: number;
};

export type AggregateRequest = {
  prompt: string;
  platforms: Platform[];
  limit: number;
  mode: AggregateMode;
};

export type AggregateResponse = {
  sessionId: string;
  title: string;
  summary: string;
  queries: Record<Platform, string[]>;
  items: QueueItem[];
};

export const defaultPlatforms: Platform[] = ["youtube", "bilibili"];

export function normalizeAggregateRequest(input: Partial<AggregateRequest>): AggregateRequest {
  const prompt = input.prompt?.trim() ?? "";

  return {
    prompt,
    platforms: input.platforms?.length ? input.platforms : defaultPlatforms,
    limit: clamp(input.limit ?? 18, 5, 40),
    mode: input.mode ?? "mixed"
  };
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}
