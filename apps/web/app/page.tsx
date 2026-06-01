"use client";

import type { AggregateResponse, Platform, QueueItem } from "@prompt-media-queue/shared";
import { useMemo, useState } from "react";
import { create } from "zustand";

type PlayerState = {
  current: QueueItem | null;
  setCurrent: (item: QueueItem) => void;
};

const usePlayerStore = create<PlayerState>((set) => ({
  current: null,
  setCurrent: (item) => set({ current: item })
}));

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function Home() {
  const [prompt, setPrompt] = useState("适合晚上写代码的中文/日文 city pop，不要太吵");
  const [platforms, setPlatforms] = useState<Platform[]>(["youtube", "bilibili"]);
  const [queue, setQueue] = useState<AggregateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = usePlayerStore((state) => state.current);
  const setCurrent = usePlayerStore((state) => state.setCurrent);

  const nextItem = useMemo(() => {
    if (!queue?.items.length || !current) {
      return queue?.items[0] ?? null;
    }

    const currentIndex = queue.items.findIndex((item) => item.id === current.id);
    return queue.items[(currentIndex + 1) % queue.items.length] ?? null;
  }, [current, queue]);

  async function aggregate() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/aggregate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          platforms,
          limit: 18,
          mode: "mixed"
        })
      });

      if (!response.ok) {
        throw new Error("Aggregation failed.");
      }

      const data = (await response.json()) as AggregateResponse;
      setQueue(data);
      if (data.items[0]) {
        setCurrent(data.items[0]);
      }
    } catch (aggregateError) {
      setError(aggregateError instanceof Error ? aggregateError.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  function togglePlatform(platform: Platform) {
    setPlatforms((currentPlatforms) => {
      if (currentPlatforms.includes(platform)) {
        return currentPlatforms.length === 1 ? currentPlatforms : currentPlatforms.filter((item) => item !== platform);
      }

      return [...currentPlatforms, platform];
    });
  }

  return (
    <main className="shell">
      <section className="workspace">
        <div className="intro">
          <p className="eyebrow">Prompt Media Queue</p>
          <h1>输入一句话，生成跨平台播放队列</h1>
          <p className="subcopy">聚合 YouTube 和 B 站结果，统一排序、统一播放列表、保留原平台播放能力。</p>
        </div>

        <div className="promptPanel">
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} />
          <div className="controls">
            <button className={platforms.includes("youtube") ? "chip active" : "chip"} onClick={() => togglePlatform("youtube")}>
              YouTube
            </button>
            <button className={platforms.includes("bilibili") ? "chip active" : "chip"} onClick={() => togglePlatform("bilibili")}>
              Bilibili
            </button>
            <button className="primary" onClick={aggregate} disabled={isLoading}>
              {isLoading ? "聚合中..." : "生成队列"}
            </button>
          </div>
          {error ? <p className="error">{error}</p> : null}
        </div>

        {current ? <Player item={current} onNext={() => nextItem && setCurrent(nextItem)} /> : <EmptyPlayer />}

        {queue ? (
          <section className="results">
            <div>
              <p className="eyebrow">Session {queue.sessionId}</p>
              <h2>{queue.title}</h2>
              <p>{queue.summary}</p>
            </div>
            <div className="queue">
              {queue.items.map((item) => (
                <button key={item.id} className={current?.id === item.id ? "queueItem selected" : "queueItem"} onClick={() => setCurrent(item)}>
                  <span className="position">{item.queuePosition}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>
                      {item.platform} · {item.creator}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Player({ item, onNext }: { item: QueueItem; onNext: () => void }) {
  return (
    <section className="player">
      <div className="frame">
        {item.embedUrl ? (
          <iframe src={item.embedUrl} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        ) : (
          <a href={item.url} target="_blank" rel="noreferrer">
            打开原平台播放
          </a>
        )}
      </div>
      <div className="nowPlaying">
        <span className="badge">{item.platform}</span>
        <h2>{item.title}</h2>
        <p>{item.reason}</p>
        <div className="playerActions">
          <a href={item.url} target="_blank" rel="noreferrer">
            原链接
          </a>
          <button onClick={onNext}>下一条</button>
        </div>
      </div>
    </section>
  );
}

function EmptyPlayer() {
  return (
    <section className="player empty">
      <div className="frame placeholder">等待生成播放队列</div>
      <div className="nowPlaying">
        <span className="badge">MVP</span>
        <h2>统一播放器会根据平台切换嵌入源</h2>
        <p>YouTube 使用 iframe embed，B 站使用外链播放器；不可嵌入内容会回退到原站链接。</p>
      </div>
    </section>
  );
}
