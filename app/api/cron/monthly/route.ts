// Design Ref: §6 — `GET /api/cron/monthly`: 매월 1일 UNEP Pipeline·UNFCCC(초기보고서·방법론) 현황을 수집·요약해 '확인 대기'로 저장한다.
// 자동 실행(Vercel Cron)만 부를 수 있다. 일정 등록은 작업 16에서 한다.
import { connection } from "next/server";
import { isAuthorizedCron } from "@/lib/collect/auth";
import { runCollectJob } from "@/lib/collect/collect";

export const maxDuration = 60;

export async function GET(request: Request) {
  await connection();

  if (!isAuthorizedCron(request)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "권한이 없습니다." } },
      { status: 401 },
    );
  }

  const results = await runCollectJob("monthly");
  return Response.json({ job: "monthly", results });
}
