// Design Ref: §4.1 ④, §7 — 검색 기준: 핵심 키워드, 검색을 허용하는 공식 공개 사이트 목록, 검색에 쓰는 모델.
// Plan SC: PRD 5번 공통 규칙 — UN 공식 자료와 국내 법령 원문을 우선하고, 뉴스는 근거로 쓰지 않는다.
// (뉴스·블로그 사이트는 이 목록에 넣지 않는다. 목록에 없는 사이트는 검색되지 않는다.)

// 검색어에 활용하는 핵심 키워드 (PRD 5번 must 1)
export const CORE_KEYWORDS = [
  "국제감축",
  "article 6",
  "cooperative approach",
] as const;

// 검색을 허용하는 공식 공개 사이트. 하위 주소(예: unfccc.int/...)도 함께 허용된다.
// ※ 부처 목록은 처음 정한 목록이다. 빠진 부처가 있으면 이 파일에 한 줄 추가하면 된다.
export const OFFICIAL_SITES = [
  // UN·UNFCCC (1순위)
  { domain: "unfccc.int", label: "UNFCCC" },
  { domain: "un.org", label: "UN" },
  // 국내 법령 원문 (국내 법령을 묻는 질문의 1순위)
  { domain: "law.go.kr", label: "국가법령정보센터" },
  // 각 부처 누리집·관련 기관 (부처별 지침). 이름은 현행 기준이며, 옛 주소에 남은 문서도 찾도록 옛 주소를 함께 둔다.
  { domain: "mcee.go.kr", label: "기후에너지환경부" },
  { domain: "me.go.kr", label: "기후에너지환경부(옛 환경부 주소)" },
  { domain: "motir.go.kr", label: "산업통상부" },
  { domain: "motie.go.kr", label: "산업통상부(옛 산업통상자원부 주소)" },
  { domain: "mofa.go.kr", label: "외교부" },
  { domain: "mofe.go.kr", label: "재정경제부" },
  { domain: "moef.go.kr", label: "재정경제부(옛 기획재정부 주소)" },
  { domain: "mof.go.kr", label: "해양수산부" },
  { domain: "forest.go.kr", label: "산림청" },
  { domain: "mafra.go.kr", label: "농림축산식품부" },
  // ※ 이 주소는 확인하지 못했다(접속 안 됨). 위원회 이름은 2026년 1월부터 국가기후위기대응위원회로 바뀐 것으로 보도되었다.
  { domain: "2050cnc.go.kr", label: "국가기후위기대응위원회(옛 2050 탄소중립녹색성장위원회)" },
  { domain: "gir.go.kr", label: "온실가스종합정보센터" },
] as const;

export const ALLOWED_DOMAINS: string[] = OFFICIAL_SITES.map((s) => s.domain);

// 검색에 쓰는 모델. 실제 답변용 모델은 작업 6에서 정한다.
export const SEARCH_MODEL = "gpt-5.4-mini";

// 모델이 쓸 수 있는 최대 출력 글자 단위(검색 결과 정리에 쓰는 한도)
export const SEARCH_MAX_OUTPUT_TOKENS = 3000;

// 근거를 찾지 못했을 때 모델이 정확히 이 문구만 답하게 한다.
export const NO_RESULT_TEXT = "검색 결과 없음";
