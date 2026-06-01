import type { AggregateRequest, AggregateResponse, Platform, QueueItem, SearchInput, UnifiedMediaItem } from "@prompt-media-queue/shared";
import { nanoid } from "nanoid";
import { bilibiliConnector } from "./connectors/bilibili.js";
import type { PlatformConnector } from "./connectors/types.js";
import { youtubeConnector } from "./connectors/youtube.js";

const connectors: Record<Platform, PlatformConnector> = {
  youtube: youtubeConnector,
  bilibili: bilibiliConnector
};

export async function aggregateMedia(request: AggregateRequest): Promise<AggregateResponse> {
  const queries = expandPrompt(request.prompt, request.platforms);
  const allItems = await Promise.all(
    request.platforms.flatMap((platform) =>
      queries[platform].map((query) => {
        const input: SearchInput = {
          prompt: request.prompt,
          query,
          mode: request.mode,
          limit: Math.ceil(request.limit / request.platforms.length)
        };

        return connectors[platform].search(input);
      })
    )
  );

  const items = rankAndDedupe(allItems.flat(), request.limit);

  return {
    sessionId: nanoid(12),
    title: makeTitle(request.prompt),
    summary: `Built a ${items.length}-item cross-platform queue from ${request.platforms.join(" and ")}.`,
    queries,
    items
  };
}

function expandPrompt(prompt: string, platforms: Platform[]): Record<Platform, string[]> {
  const cleanPrompt = prompt || "focused music";
  const platformQueries = {
    youtube: [`${cleanPrompt} playlist`, `${cleanPrompt} live mix`],
    bilibili: [`${cleanPrompt} 歌单`, `${cleanPrompt} 合集`]
  } satisfies Record<Platform, string[]>;

  return platforms.reduce(
    (acc, platform) => {
      acc[platform] = platformQueries[platform];
      return acc;
    },
    { youtube: [], bilibili: [] } as Record<Platform, string[]>
  );
}

function rankAndDedupe(items: UnifiedMediaItem[], limit: number): QueueItem[] {
  const seen = new Set<string>();

  return items
    .filter((item) => {
      const key = `${item.platform}:${item.externalId}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({
      ...item,
      queuePosition: index + 1
    }));
}

function makeTitle(prompt: string): string {
  if (!prompt.trim()) {
    return "Cross-platform focus queue";
  }

  return prompt.length > 48 ? `${prompt.slice(0, 45)}...` : prompt;
}
