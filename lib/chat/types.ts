// Design Ref: §3.2, §4.1 — 챗봇 질문·답변이 서버와 화면 사이에서 주고받는 모양.
// 비밀 값이 없는 타입만 두므로 화면(클라이언트) 코드에서도 불러와도 된다.

// 답변 한 건의 출처 (작업 5·6에서 실제 값을 채운다)
export type AnswerSource = {
  documentName: string; // 문서명
  article: string; // 조항
  lastRevised: string; // 마지막 개정일(없으면 채택일·발표일)
  url: string; // 원문 링크
};

export type ChatAnswer = {
  text: string; // 답변 본문
  sources: AnswerSource[]; // 출처 목록
  disclaimer: string; // 면책 문구
};

// 답변 아래에 보여 주는 안내 링크 묶음 (문의처, 월별 변동사항 화면 등)
export type ChatNotice = {
  title: string; // 안내 제목
  links: { label: string; href: string }[]; // href가 "/"로 시작하면 이 서비스 안의 화면, 아니면 외부 사이트
};

// 질문이 성공했을 때 서버가 돌려주는 값
export type ChatSuccessResponse = {
  // answered: 근거를 찾아 답함
  // unverified: 근거를 못 찾았거나 법률 판단 질문이라 "확인되지 않음"으로 처리함 (문의 안내가 붙는다)
  // project_status: 사업 진행현황 질문이라 월별 변동사항 화면으로 안내함
  status: "answered" | "unverified" | "project_status";
  answer: ChatAnswer;
  // 상태가 unverified·project_status일 때 붙는 안내 링크
  notice?: ChatNotice;
  // 오늘 남은 질문 횟수. 하루 5개 제한은 작업 9에서 만들기 전까지 null(알 수 없음)이다.
  remaining: number | null;
  // 실제 검색·AI 답변이 아니라 틀을 확인하려는 임시 답변인지 여부 (작업 6 전까지 true)
  temporary: boolean;
};

// 오류가 났을 때 서버가 돌려주는 값 (설계 문서 §6의 통일된 모양)
export type ChatErrorResponse = {
  error: {
    code: string;
    message: string; // 사용자에게 그대로 보여 줄 한국어 문장
  };
  // 하루 질문 한도를 넘었을 때 화면의 남은 횟수를 0으로 맞추기 위한 값
  remaining?: number;
};
