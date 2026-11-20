// Design Ref: §6 — `GET /api/cron/cleanup`: 기간이 지난 데이터를 지운다(질문 90일, 질문 횟수 7일, 뉴스 90일, 반려 요약 30일).
// 자동 실행(Vercel Cron)만 부를 수 있다.
import { connection } from "next/server";
import { isAuthorizedCron } from "@/lib/collect/auth";
import { callRpc } from "@/lib/db";

export const maxDuration = 60;

const JOBS = [
  { name: "questions", fn: "cleanup_expired_questions" },
  { name: "daily_usage", fn: "cleanup_daily_usage" },
  { name: "news", fn: "cleanup_expired_news" },
  { name: "rejected_summaries", fn: "cleanup_rejected_summaries" },
] as const;

export async function GET(request: Request) {
  await connection();

  if (!isAuthorizedCron(request)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "권한이 없습니다." } },
      { status: 401 },
    );
  }

  // 하나가 실패해도 나머지는 계속한다.
  const removed: Record<string, number | string> = {};
  for (const job of JOBS) {
    try {
      removed[job.name] = (await callRpc<number>(job.fn, {})) ?? 0;
    } catch (error) {
      removed[job.name] = "failed";
      console.error(`정리 실패(${job.name}):`, error instanceof Error ? error.name : error);
    }
  }
  return Response.json({ job: "cleanup", removed });
}
