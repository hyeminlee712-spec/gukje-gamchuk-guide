"use client";

// Design Ref: §3.3 — 월별 변동사항 본문: 세 구역(UN 규정 변동 / UNEP Pipeline / UNFCCC)을 나눠 보여 준다.
// UNFCCC 구역 안에서는 초기보고서와 방법론을 나눠 보여 준다. 게시된 요약만 보이고, 항목이 없는 구역에는 안내 문구를 보여 준다.
// 요약은 `GET /api/summaries`에서 가져온다.
import { useEffect, useState } from "react";
import SummaryCard from "@/components/monthly/SummaryCard";
import { SUMMARY_SECTIONS, type SummaryItem } from "@/lib/summaries/types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: SummaryItem[] };

export default function MonthlySummaries() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/summaries");
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setState({
            kind: "error",
            message:
              data?.error?.message ??
              "변동사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          });
          return;
        }
        setState({ kind: "ready", items: data.summaries as SummaryItem[] });
      } catch {
        if (!cancelled) {
          setState({
            kind: "error",
            message: "변동사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    return <p className="text-sm text-foreground/70">변동사항을 불러오는 중…</p>;
  }

  if (state.kind === "error") {
    return (
      <p
        role="alert"
        className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
      >
        {state.message}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {SUMMARY_SECTIONS.map((section) => (
        <section key={section.title} aria-labelledby={section.title}>
          <h2 id={section.title} className="text-lg font-bold">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-foreground/70">{section.description}</p>

          <div className="mt-3 space-y-4">
            {section.categories.map(({ category, label }) => {
              const sectionItems = state.items.filter((i) => i.category === category);
              return (
                <div key={category} className="space-y-3">
                  {label && <h3 className="text-sm font-semibold">{label}</h3>}
                  {sectionItems.length === 0 ? (
                    <p className="text-sm text-foreground/70">
                      이번 달 변동사항이 없습니다.
                    </p>
                  ) : (
                    sectionItems.map((item) => (
                      <SummaryCard key={item.id} item={item} />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
