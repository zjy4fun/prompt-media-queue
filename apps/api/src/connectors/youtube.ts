import type { SearchInput, UnifiedMediaItem } from "@prompt-media-queue/shared";
import type { PlatformConnector } from "./types.js";

const sampleVideoIds = ["jfKfPfyJRdk", "DWcJFNfaw9c", "5qap5aO4i9A", "NJuSStkIZBg"];

export const youtubeConnector: PlatformConnector = {
  platform: "youtube",

  async search(input: SearchInput) {
    return sampleVideoIds.slice(0, input.limit).map((videoId, index): UnifiedMediaItem => ({
      id: `youtube:${videoId}`,
      platform: "youtube",
      externalId: videoId,
      title: `${input.query} - YouTube pick ${index + 1}`,
      creator: index % 2 === 0 ? "Lo-fi Radio" : "Curated Music Channel",
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      durationSec: 3600,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1`,
      contentType: "video",
      playableMode: "embed",
      score: 88 - index * 5,
      reason: "Matched the prompt mood and is embeddable through YouTube."
    }));
  },

  async resolveUrl(url: string) {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).pop();

    if (!videoId) {
      return null;
    }

    return {
      id: `youtube:${videoId}`,
      platform: "youtube",
      externalId: videoId,
      title: "Imported YouTube video",
      creator: "YouTube",
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url,
      embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1`,
      contentType: "video",
      playableMode: "embed",
      score: 70,
      reason: "Imported from a YouTube link."
    };
  },

  getEmbedConfig(item) {
    if (!item.embedUrl) {
      return null;
    }

    return {
      provider: "youtube",
      src: item.embedUrl,
      title: item.title,
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    };
  }
};
