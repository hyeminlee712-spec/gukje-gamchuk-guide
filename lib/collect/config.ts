// Design Ref: §4.2 — 월별 변동사항 자동 수집 기준: 구분별 검색 허용 사이트와 찾을 내용.
// Plan SC: 작업 12 — UN 공식 자료를 1순위로 하고, 뉴스는 근거로 쓰지 않는다.
import type { SummaryCategory } from "@/lib/summaries/types";

// 수집에 쓰는 모델(검색 + 요약)
export const COLLECT_MODEL = "gpt-5.4-mini";
export const COLLECT_MAX_OUTPUT_TOKENS = 4000;

// 요약 최대 글자 수 (PRD·DB 제한과 같다)
export const SUMMARY_MAX_LENGTH = 300;
// 한 번에 저장할 최대 항목 수(구분당)
export const MAX_ITEMS_PER_CATEGORY = 5;

export type CollectJob = "un-changes" | "monthly";

type CategoryRule = {
  category: SummaryCategory;
  job: CollectJob;
  label: string;
  // 검색을 허용하는 공식 사이트(하위 주소 포함). 뉴스·블로그는 넣지 않는다.
  domains: string[];
  // 모델에게 알려 주는 찾을 대상과 중요 기준
  target: string;
  // 되돌아볼 기간(일). 주 1회 확인은 직전 확인과 겹치게 넉넉히 잡는다.
  lookbackDays: number;
};

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "un_rules",
    job: "un-changes",
    label: "UN 규정 변동",
    domains: ["unfccc.int"],
    target:
      "파리협정 제6조 관련 당사국총회(CMA) 결정문과 제6.4조 감독기구(Supervisory Body)의 표준·지침·방법론 결정 중, " +
      "규정이 새로 생기거나 개정·폐지된 것, 제출 기한·절차가 바뀐 것만 찾습니다. 사소한 문구 수정은 제외합니다. " +
      "기준일은 결정문이 채택된(나온) 날짜입니다.",
    lookbackDays: 14,
  },
  {
    category: "unfccc_initial_report",
    job: "monthly",
    label: "UNFCCC 초기보고서 현황",
    domains: ["unfccc.int"],
    target:
      "파리협정 제6조 협력적 접근(6.2)의 초기보고서(Initial Report) 제출·검토 현황 중 한국이 관련된 것과 지난달 대비 달라진 내용만 찾습니다. " +
      "기준일은 원문에 적힌 갱신일이며, 원문에 없으면 찾은 날짜(오늘)입니다.",
    lookbackDays: 45,
  },
  {
    category: "unfccc_methodology",
    job: "monthly",
    label: "UNFCCC 방법론 현황",
    domains: ["unfccc.int"],
    target:
      "파리협정 제6.4조 메커니즘의 방법론(Methodology) 승인·개정·검토 현황 중 한국이 관련된 것과 지난달 대비 달라진 내용만 찾습니다. " +
      "기준일은 원문에 적힌 갱신일이며, 원문에 없으면 찾은 날짜(오늘)입니다.",
    lookbackDays: 45,
  },
];

export function rulesForJob(job: CollectJob): CategoryRule[] {
  return CATEGORY_RULES.filter((r) => r.job === job);
}
