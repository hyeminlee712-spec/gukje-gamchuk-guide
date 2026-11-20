// Design Ref: §3.3 — 항목 카드: 제목 · 국문 요약(300자 이내) · 기준일 · [원문 링크]
import type { SummaryItem } from "@/lib/summaries/types";

type SummaryCardProps = { item: SummaryItem };

export default function SummaryCard({ item }: SummaryCardProps) {
  return (
    <article className="border border-line bg-white p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h5 className="font-semibold">{item.title}</h5>
        {/* 화면 확인용 샘플이면 실제 요약이 아니라는 것을 분명히 알린다 */}
        {item.isSample && (
          <span className="rounded bg-foreground/10 px-2 py-0.5 text-xs">
            샘플 · 실제 요약이 아닙니다
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed">{item.summaryKo}</p>

      <p className="mt-3 text-xs text-foreground/70">
        기준일 {item.asOf}{" "}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          [원문 링크]
        </a>
      </p>
    </article>
  );
}
