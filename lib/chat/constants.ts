// Design Ref: §3.2 — 화면과 서버가 함께 쓰는 챗봇 기준 값.
// zod 같은 무거운 도구 없이 값만 두어 화면(클라이언트) 코드가 가볍게 불러올 수 있다.

import { LEGAL_DISCLAIMER } from "@/lib/notices";

// 질문 최대 글자 수
export const MAX_QUESTION_LENGTH = 300;

// 답변 본문 최대 글자 수 (출처·면책 문구는 세지 않는다. PRD 5번 must 1)
export const MAX_ANSWER_LENGTH = 500;

// 면책 문구: 모든 답변에 항상 붙인다(PRD 5번 must 1). 문구 자체는 lib/notices.ts에서 관리한다.
export const DISCLAIMER = LEGAL_DISCLAIMER;

// 하루에 할 수 있는 질문 수 (PRD 7번). 실제 제한은 작업 9에서 서버가 적용한다.
export const DAILY_QUESTION_LIMIT = 5;

// 하루 한도를 모두 썼을 때 보여 주는 안내 (서버 응답과 화면이 같은 문장을 쓴다)
export const LIMIT_REACHED_MESSAGE = `오늘 질문 ${DAILY_QUESTION_LIMIT}개를 모두 사용했습니다. 내일 다시 이용해 주세요.`;
