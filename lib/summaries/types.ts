// Design Ref: §3.3, §5 summaries — 월별 변동사항 요약의 모양과 구분 이름.
// 비밀 값이 없어 서버·화면 어디에서든 불러올 수 있다.

// 구분 (DB의 category 값과 같다)
export type SummaryCategory =
  | "un_rules"
  | "unep_pipeline"
  | "unfccc_initial_report"
  | "unfccc_methodology";

export type SummaryItem = {
  id: string;
  category: SummaryCategory;
  title: string;
  summaryKo: string; // 국문 요약(300자 이내)
  sourceUrl: string; // 원문 링크
  asOf: string; // 기준일 (YYYY-MM-DD)
  isSample: boolean; // 화면 확인용 샘플이면 true
};

// 화면에 보여 줄 구역 순서와 이름 (UNFCCC는 한 구역 안에서 초기보고서와 방법론을 나눠 보여 준다)
export const SUMMARY_SECTIONS: {
  title: string;
  description: string;
  categories: { category: SummaryCategory; label?: string }[];
}[] = [
  {
    title: "UN 규정 변동",
    description:
      "파리협정 제6조 관련 결정문과 감독기구 결정의 변동 요약입니다.",
    categories: [{ category: "un_rules" }],
  },
  {
    title: "UNEP Pipeline 사업 현황",
    description: "한국이 관련된 사업과 지난달 대비 달라진 내용의 요약입니다.",
    categories: [{ category: "unep_pipeline" }],
  },
  {
    title: "UNFCCC 초기보고서·방법론 현황",
    description: "초기보고서(Initial Report)와 방법론(Methodology) 현황 요약입니다.",
    categories: [
      { category: "unfccc_initial_report", label: "초기보고서" },
      { category: "unfccc_methodology", label: "방법론" },
    ],
  },
];
