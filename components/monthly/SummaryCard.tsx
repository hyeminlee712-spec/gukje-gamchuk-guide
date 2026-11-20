// Design Ref: §3.3 — 항목 카드: 제목 · 국문 요약(300자 이내) · 기준일 · [원문 링크]
// 초기보고서 현황 카드는 "제출국가 / 검토보고 / 중대한 불일치" 세 항목을 아이콘과 서로 다른 글자색으로 나눠 보여 준다.
import type { SummaryItem } from "@/lib/summaries/types";

type SummaryCardProps = { item: SummaryItem };

// 요약 글 "초기보고서 제출국가 26개국, 검토보고 16건, 중대한 불일치 11건"에서 숫자 세 개를 읽는다. 형식이 다르면 null.
function parseInitialReportStats(text: string): { parties: string; reviews: string; inconsistencies: string } | null {
  const m = text.match(/제출국가\s*(\d+)\s*개국.*?검토보고\s*(\d+)\s*건.*?중대한\s*불일치\s*(\d+)\s*건/);
  return m ? { parties: m[1], reviews: m[2], inconsistencies: m[3] } : null;
}

// 아이콘(꾸밈용). 선 그림 모양으로 글자색을 그대로 따른다.
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// 항목마다 아이콘과 글자색을 달리한다: 제출국가(파랑·지구본), 검토보고(초록·확인 문서), 중대한 불일치(빨강·경고).
const STAT_ROWS = [
  {
    key: "parties",
    label: "초기보고서 제출국가",
    unit: "개국",
    color: "text-[#0468b1]",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
      </Icon>
    ),
  },
  {
    key: "reviews",
    label: "검토보고",
    unit: "건",
    color: "text-[#2e7d32]",
    icon: (
      <Icon>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="m9 14 2 2 4-4" />
      </Icon>
    ),
  },
  {
    key: "inconsistencies",
    label: "중대한 불일치",
    unit: "건",
    color: "text-[#d12800]",
    icon: (
      <Icon>
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </Icon>
    ),
  },
] as const;

export default function SummaryCard({ item }: SummaryCardProps) {
  const stats =
    item.category === "unfccc_initial_report" ? parseInitialReportStats(item.summaryKo) : null;

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

      {stats ? (
        // 요약 글과 같은 내용을 항목별로 나눠 보여 준다(스크린 리더에는 원래 요약 글을 읽어 준다).
        <>
          <p className="sr-only">{item.summaryKo}</p>
          <ul aria-hidden className="mt-2 space-y-2">
            {STAT_ROWS.map((row) => (
              <li key={row.key} className={`flex items-center gap-3 ${row.color}`}>
                {row.icon}
                <span className="text-sm font-bold">{row.label}</span>
                <span className="ml-auto text-2xl font-extrabold tabular-nums">
                  {stats[row.key]}
                  <span className="ml-0.5 text-sm font-bold">{row.unit}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm leading-relaxed">{item.summaryKo}</p>
      )}

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
