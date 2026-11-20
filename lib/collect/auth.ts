// Design Ref: §6 — `/api/cron/*`는 자동 실행(Vercel Cron)만 부를 수 있다. Vercel은 CRON_SECRET을 `Authorization: Bearer …`로 보낸다.
// 서버 코드에서만 불러온다. 비밀 값이 없으면 모두 거부한다(열어 두지 않는다).
import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  // 길이가 다르면 timingSafeEqual이 오류를 내므로 먼저 비교한다.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
