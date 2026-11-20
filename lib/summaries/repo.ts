// Design Ref: §3.3 — 월별 변동사항: 게시된 요약만 저장소에서 읽는다(확인 대기·반려 요약은 사용자에게 보이지 않는다).
// 서버 코드에서만 불러온다.
import { selectRows } from "@/lib/db";
import type { SummaryCategory, SummaryItem } from "@/lib/summaries/types";

// 저장소 표(summaries)의 열 이름 그대로의 모양
type SummaryRow = {
  id: string;
  category: SummaryCategory;
  title: string;
  summary_ko: string;
  source_url: string;
  as_of: string;
  is_sample: boolean;
};

// 상태가 '게시'인 요약을 기준일이 최근인 순서로 가져온다.
export async function listPublishedSummaries(): Promise<SummaryItem[]> {
  // 이번 달(한국시간)에 게시된 요약만 보여 준다. 지난달 이전 요약은 빠지고, 없으면 "이번 달 변동사항이 없습니다"가 나온다(CHECK.md 중요 5).
  const monthStart = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" })
    .format(new Date())
    .slice(0, 7);
  const rows = await selectRows<SummaryRow>("summaries", {
    select: "id,category,title,summary_ko,source_url,as_of,is_sample",
    status: "eq.published",
    published_at: `gte.${monthStart}-01T00:00:00+09:00`,
    order: "as_of.desc,created_at.desc",
  });

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    summaryKo: row.summary_ko,
    sourceUrl: row.source_url,
    asOf: row.as_of,
    isSample: row.is_sample,
  }));
}
