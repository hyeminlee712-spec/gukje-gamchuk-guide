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
  published_at: string | null;
};

// 상태가 '게시'인 요약을 가져온다.
// - 규정 및 지침 등·UNEP Pipeline: "변동" 소식이라 이번 달(한국시간)에 게시된 것만 보여 준다(CHECK.md 중요 5). 없으면 "이번 달 변동사항이 없습니다"가 나온다.
// - 초기보고서 현황: 현재 상태를 보여 주는 항목이라 월과 상관없이 가장 최근에 게시된 1건만 보여 준다.
// - 승인된 메커니즘 방법론: 승인된 것은 목록에 계속 남으므로 게시된 것을 모두 기호 번호 순으로 보여 준다.
export async function listPublishedSummaries(): Promise<SummaryItem[]> {
  const monthStart = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" })
    .format(new Date())
    .slice(0, 7);
  const rows = await selectRows<SummaryRow>("summaries", {
    select: "id,category,title,summary_ko,source_url,as_of,is_sample,published_at",
    status: "eq.published",
    order: "as_of.desc,created_at.desc",
  });

  const monthStartIso = new Date(`${monthStart}-01T00:00:00+09:00`).getTime();
  let latestReportSeen = false;
  const visible = rows.filter((row) => {
    if (row.category === "unfccc_methodology") return true;
    if (row.category === "unfccc_initial_report") {
      if (latestReportSeen) return false; // 가장 최근 1건만
      latestReportSeen = true;
      return true;
    }
    return !!row.published_at && new Date(row.published_at).getTime() >= monthStartIso;
  });

  // 방법론은 기호 번호(A6.4-AMM-001…) 순서로 보여 준다.
  visible.sort((x, y) =>
    x.category === "unfccc_methodology" && y.category === "unfccc_methodology"
      ? x.title.localeCompare(y.title)
      : 0,
  );

  return visible.map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    summaryKo: row.summary_ko,
    sourceUrl: row.source_url,
    asOf: row.as_of,
    isSample: row.is_sample,
  }));
}
