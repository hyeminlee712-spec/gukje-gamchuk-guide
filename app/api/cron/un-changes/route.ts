// Design Ref: §6 — `GET /api/cron/un-changes`: 주 1회 UN 규정 변동(CMA 결정문, 제6.4조 감독기구 결정)을 확인해 '확인 대기'로 저장한다.
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

  const results = await runCollectJob("un-changes");
  return Response.json({ job: "un-changes", results });
}
