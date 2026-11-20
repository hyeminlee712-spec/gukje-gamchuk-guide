"use client";

// Design Ref: §3.3 — 월별 변동사항 본문: 세 구역(UN 규정 변동 / UNEP Pipeline / UNFCCC)을 나눠 보여 준다.
// UNFCCC 구역 안에서는 초기보고서와 방법론을 나눠 보여 준다. 게시된 요약만 보이고, 항목이 없는 구역에는 안내 문구를 보여 준다.
// 요약은 `GET /api/summaries`에서 가져온다.
import { useEffect, useState } from "react";
import ItmoChart from "@/components/monthly/ItmoChart";
import SummaryCard from "@/components/monthly/SummaryCard";
import { SUMMARY_SECTIONS, type SummaryItem } from "@/lib/summaries/types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; items: SummaryItem[] };

// 가·나·다 구역마다 다른 색 왼쪽 줄과 제목색을 쓴다.
const TONES = [
  { box: "border-l-[6px] border-[#6b3fa0]", title: "text-[#6b3fa0]" },
  { box: "border-l-[6px] border-[#c4247a]", title: "text-[#c4247a]" },
  { box: "border-l-[6px] border-[#00859b]", title: "text-[#00859b]" },
] as const;

// bare: true이면 구역 상자·제목 없이 카드만 보여 준다(홈 화면에서 코너가 제목을 대신할 때).
// sections: 보여 줄 구역 번호(0=가, 1=나, 2=다). 없으면 모두 보여 준다. 홈 화면에서 구역을 나눠 배치할 때 쓴다.
export default function MonthlySummaries({ sections, bare }: { sections?: number[]; bare?: boolean } = {}) {
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
        className="rounded-sm border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
      >
        {state.message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {SUMMARY_SECTIONS.map((section, index) => {
        if (sections && !sections.includes(index)) return null;
        const tone = TONES[index % TONES.length];
        if (bare) {
          const own = section.categories.flatMap(({ category }) => state.items.filter((i) => i.category === category));
          return own.length === 0 ? (
            <p key={section.title} className="text-sm text-foreground/70">이번 달 변동사항이 없습니다.</p>
          ) : (
            <div key={section.title} className="space-y-3">
              {own.map((item) => (
                <SummaryCard key={item.id} item={item} />
              ))}
            </div>
          );
        }
        const headingId = `latest-section-${index}`;
        return (
          <section
            key={section.title}
            aria-labelledby={headingId}
            className={`border border-line bg-white p-5 ${tone.box}`}
          >
            <h3 id={headingId} className={`text-xl font-extrabold tracking-tight ${tone.title}`}>
              {section.title}
            </h3>
            {section.description && <p className="mt-1 text-sm text-foreground/70">{section.description}</p>}

            <div className="mt-3 space-y-4">
              {section.categories[0]?.category === "unep_pipeline" ? (
                // UNEP Pipeline 현황은 AI 요약 대신 원문 사이트의 ITMOs 목록을 그대로 막대그래프로 보여 준다.
                <ItmoChart />
              ) : null}
              {section.categories[0]?.category === "unep_pipeline" ? null : section.categories.map(({ category, label }) => {
                const sectionItems = state.items.filter((i) => i.category === category);
                return (
                  <div key={category} className="space-y-3">
                    {label && <h4 className="text-sm font-semibold">{label}</h4>}
                    {sectionItems.length === 0 ? (
                      <p className="text-sm text-foreground/70">
                        {category === "unfccc_initial_report" || category === "unfccc_methodology"
                          ? "게시된 현황이 없습니다."
                          : "이번 달 변동사항이 없습니다."}
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
        );
      })}
    </div>
  );
}
