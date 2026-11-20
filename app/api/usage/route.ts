// Design Ref: §3.2 — `GET /api/usage`: 오늘 남은 질문 수를 알려 준다(화면의 "오늘 남은 질문: N / 5").
// 브라우저 구분 값이 아직 없으면(처음 방문) 한도 전체가 남은 것이다. 이 경로는 구분 값을 새로 만들지 않는다.
import { DAILY_QUESTION_LIMIT } from "@/lib/chat/constants";
import {
  getRemainingQuestions,
  hashBrowserId,
  readBrowserId,
} from "@/lib/usage/usage";

export async function GET() {
  // 요청 정보(쿠키)를 읽는 부분은 try 밖에 둔다. Next.js가 "요청 때 실행" 판단에 쓰는 신호를 삼키지 않기 위해서다.
  const browserId = await readBrowserId();

  try {
    const remaining = browserId
      ? await getRemainingQuestions(hashBrowserId(browserId))
      : DAILY_QUESTION_LIMIT;
    return Response.json({ remaining, limit: DAILY_QUESTION_LIMIT });
  } catch (error) {
    // 저장소 오류 내용(주소·키)은 내보내지 않고 종류만 남긴다. 화면은 횟수를 모르는 상태로 둔다.
    console.error("남은 횟수 조회 실패:", error instanceof Error ? error.name : error);
    return Response.json({ remaining: null, limit: DAILY_QUESTION_LIMIT });
  }
}
