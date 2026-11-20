// Design Ref: §6 — `GET /api/summaries`: 게시된 월별 요약만 돌려준다(확인 대기·반려 요약은 나가지 않는다).
// 월별 변동사항 화면이 이 경로로 요약을 가져온다. 누구나 읽을 수 있다.
import { connection } from "next/server";
import type { ChatErrorResponse } from "@/lib/chat/types";
import { listPublishedSummaries } from "@/lib/summaries/repo";

export async function GET() {
  // 요청이 올 때마다 저장소에서 읽는다(빌드 때 미리 만들어 두지 않는다). 오류 처리(try) 밖에 두어
  // Next.js가 "요청 때 실행" 판단에 쓰는 신호를 삼키지 않게 한다.
  await connection();

  try {
    const summaries = await listPublishedSummaries();
    return Response.json({ summaries });
  } catch (error) {
    // 저장소 상세 오류(주소·키)는 내보내지 않고 종류만 남긴다.
    console.error("월별 요약 읽기 실패:", error instanceof Error ? error.name : error);
    const body: ChatErrorResponse = {
      error: {
        code: "SUMMARIES_UNAVAILABLE",
        message: "변동사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
    };
    return Response.json(body, { status: 502 });
  }
}
