"use client";

// Design Ref: §3.4 — 오늘의 뉴스 목록: 제목 · 언론사 · 날짜 · (100자 이내 요약) · [원문 링크]. `GET /api/news`에서 가져온다.
// 논조·언론사로 거르지 않고, 요약은 평가 없이 사실만 보여 준다(수집 단계에서 지킨다).
import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/news/repo";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: NewsItem[] };

const ERROR_TEXT = "뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

export default function NewsList() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setState({ kind: "error", message: data?.error?.message ?? ERROR_TEXT });
        else setState({ kind: "ready", items: data.news as NewsItem[] });
      } catch {
        if (!cancelled) setState({ kind: "error", message: ERROR_TEXT });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") return <p className="text-sm text-foreground/70">뉴스를 불러오는 중…</p>;
  if (state.kind === "error") {
    return (
      <p role="alert" className="rounded-sm border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
        {state.message}
      </p>
    );
  }
  if (state.items.length === 0) return <p className="text-sm text-foreground/70">새 기사가 없습니다.</p>;

  return (
    <ul className="space-y-3">
      {state.items.map((n) => (
        <li key={n.id} className="border border-line bg-white p-4">
          <h3 className="font-semibold">{n.title}</h3>
          {n.originalTitle && <p className="mt-0.5 text-xs text-foreground/60">원제: {n.originalTitle}</p>}
          {n.summaryKo && <p className="mt-2 text-sm leading-relaxed">{n.summaryKo}</p>}
          <p className="mt-3 text-xs text-foreground/70">
            {n.outlet} · {n.publishedOn}{" "}
            <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              [원문 링크]
            </a>
          </p>
        </li>
      ))}
    </ul>
  );
}
