// Design Ref: §3.5 — 관리자 로그인. 비밀번호가 맞으면 세션 쿠키를 준다.
import { cookies } from "next/headers";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  clearFailures,
  createSessionValue,
  isLocked,
  recordFailure,
  verifyPassword,
} from "@/lib/admin/auth";

const bodySchema = z.object({ password: z.string().min(1).max(200) });

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  // 접속 주소 기준으로 실패 횟수를 센다(주소를 저장하지는 않고 메모리에서만 쓴다).
  const id = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isLocked(id)) {
    return fail(429, "LOGIN_LOCKED", "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.");
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(400, "INVALID_INPUT", "비밀번호를 입력해 주세요.");

  const session = createSessionValue();
  if (!session) {
    return fail(503, "ADMIN_NOT_CONFIGURED", "관리자 비밀번호가 설정되지 않았습니다.");
  }

  if (!verifyPassword(parsed.data.password)) {
    recordFailure(id);
    return fail(401, "WRONG_PASSWORD", "비밀번호가 맞지 않습니다.");
  }

  clearFailures(id);
  (await cookies()).set(ADMIN_COOKIE, session, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return Response.json({ ok: true });
}
