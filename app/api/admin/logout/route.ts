// Design Ref: §3.5 — 관리자 로그아웃. 세션 쿠키를 지운다.
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/admin/auth";

export async function POST() {
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
