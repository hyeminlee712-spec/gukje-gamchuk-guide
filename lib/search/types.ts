// Design Ref: §4.1 ④ — 검색 결과의 모양. 작업 6(근거 기반 답변)이 이 값을 받아 쓴다.

// 검색으로 찾은 자료 하나
export type SearchSource = {
  title: string; // 문서(페이지) 제목
  url: string; // 원문 링크
  domain: string; // 어느 공식 사이트에서 찾았는지 (예: unfccc.int)
};

export type SearchResult = {
  // 공식 사이트에서 근거를 찾았는지 여부. false이면 답변을 만들지 않고 "확인되지 않음"으로 처리한다(작업 7).
  found: boolean;
  // 찾은 자료 목록 (공식 사이트 주소만 남긴다)
  sources: SearchSource[];
  // 찾은 내용을 문서명·조항·개정일·핵심 내용으로 정리한 글 (작업 6에서 답변의 재료가 된다)
  findings: string;
  // 실제로 쓴 검색어 (점검용)
  queries: string[];
};
