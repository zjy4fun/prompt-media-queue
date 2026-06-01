import type { SearchInput, UnifiedMediaItem } from "@prompt-media-queue/shared";
import type { PlatformConnector } from "./types.js";

const sampleVideos = [
  { bvid: "BV1GJ411x7h7", aid: "170001", cid: "280001", creator: "Bilibili Music" },
  { bvid: "BV1xx411c7mD", aid: "170002", cid: "280002", creator: "City Pop Archive" },
  { bvid: "BV1Ks411W7zA", aid: "170003", cid: "280003", creator: "Study Room" },
  { bvid: "BV1Zx411c7mD", aid: "170004", cid: "280004", creator: "Daily Mix" }
];

export const bilibiliConnector: PlatformConnector = {
  platform: "bilibili",

  search(input: SearchInput) {
    return Promise.resolve(sampleVideos.slice(0, input.limit).map((video, index): UnifiedMediaItem => ({
      id: `bilibili:${video.bvid}`,
      platform: "bilibili",
      externalId: video.bvid,
      title: `${input.query} - Bilibili pick ${index + 1}`,
      creator: video.creator,
      thumbnailUrl: `https://archive.biliimg.com/bfs/archive/${video.bvid}.jpg`,
      durationSec: 1800 + index * 240,
      url: `https://www.bilibili.com/video/${video.bvid}`,
      embedUrl: `https://player.bilibili.com/player.html?bvid=${video.bvid}&page=1&high_quality=1`,
      contentType: "video",
      playableMode: "embed",
      score: 84 - index * 4,
      reason: "Matched Chinese-language discovery intent and supports iframe playback."
    })));
  },

  resolveUrl(url: string) {
    const bvid = /BV[a-zA-Z0-9]+/.exec(url)?.[0];

    if (!bvid) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      id: `bilibili:${bvid}`,
      platform: "bilibili",
      externalId: bvid,
      title: "Imported Bilibili video",
      creator: "Bilibili",
      url,
      embedUrl: `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1`,
      contentType: "video",
      playableMode: "embed",
      score: 70,
      reason: "Imported from a Bilibili link."
    });
  },

  getEmbedConfig(item) {
    if (!item.embedUrl) {
      return null;
    }

    return {
      provider: "bilibili",
      src: item.embedUrl,
      title: item.title,
      allow: "autoplay; fullscreen; picture-in-picture"
    };
  }
};
