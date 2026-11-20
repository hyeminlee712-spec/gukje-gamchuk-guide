// Design Ref: §5 questions — 질문을 서비스 개선 목적으로 익명 저장한다.
// Plan SC: 작업 10 / PRD 7번 — 이메일·전화번호를 가린 질문만 저장하고, 누가 물었는지 알 수 있는 정보는 저장하지 않는다.
// 저장하는 것: 가려진 질문 글, 결과 종류, 저장 시각(90일 뒤 삭제). 브라우저 구분 값·IP·답변 내용은 저장하지 않는다.
// 서버 코드에서만 불러온다.
import { callRpc } from "@/lib/db";

// 질문이 어떻게 처리되었는지 (서비스 개선 때 "어떤 질문에 답을 못 했는지" 보기 위한 값)
export type QuestionOutcome =
  | "answered" // 근거를 찾아 답함
  | "no_evidence" // 근거를 못 찾아 "확인되지 않음"
  | "legal_judgment" // 법률 판단 질문이라 답하지 않음
  | "project_status"; // 사업 현황 질문이라 월별 화면으로 안내함

// 질문을 저장한다. 저장이 실패해도 사용자 답변은 막지 않는다(실패는 종류만 기록한다).
// 반드시 개인정보를 가린(maskPersonalInfo) 질문만 넘긴다.
export async function saveQuestion(
  maskedQuestion: string,
  outcome: QuestionOutcome,
): Promise<void> {
  try {
    await callRpc<null>("save_question", {
      p_question: maskedQuestion,
      p_outcome: outcome,
    });
  } catch (error) {
    console.error("질문 저장 실패:", error instanceof Error ? error.name : error);
  }
}
