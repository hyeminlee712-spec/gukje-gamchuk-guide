// Design Ref: §6 — `GET /api/cron/news`: 평일 오전 8시(한국시간) 뉴스 수집. 자동 실행(Vercel Cron)만 부를 수 있다.
// 일정 등록은 작업 16에서 한다. 수집이 실패해도 기존 기사는 그대로 보인다.
import { connection } from "next/server";
import { isAuthorizedCron } from "@/lib/collect/auth";
import { collectNews } from "@/lib/news/collect";

export const maxDuration = 60;

export async function GET(request: Request) {
  await connection();

  if (!isAuthorizedCron(request)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "권한이 없습니다." } },
      { status: 401 },
    );
  }
  return Response.json({ job: "news", result: await collectNews() });
}
