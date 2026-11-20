// Design Ref: §3.5 — 관리자 화면은 비밀번호 1개(ADMIN_PASSWORD)로만 연다. 일반 사용자 로그인과는 별개다.
// 로그인에 성공하면 서명된 세션 쿠키(admin_session, httpOnly)를 준다. 서버 코드에서만 불러온다.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
const SESSION_HOURS = 8;

function secret(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.length >= 8 ? value : null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(`admin-session:${payload}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// 입력한 비밀번호가 맞는지 확인한다. 비밀번호가 설정되지 않았거나 너무 짧으면 항상 거부한다.
export function verifyPassword(input: string): boolean {
  const key = secret();
  if (!key) return false;
  // 길이가 달라도 같은 방식으로 비교하도록 해시로 바꿔 비교한다.
  return safeEqual(sign("pw", input), sign("pw", key));
}

// 만료 시각이 들어간 세션 값을 만든다. (만료시각.서명)
export function createSessionValue(): string | null {
  const key = secret();
  if (!key) return null;
  const expires = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  return `${expires}.${sign(expires, key)}`;
}

export const SESSION_MAX_AGE_SECONDS = SESSION_HOURS * 3600;

// 지금 요청이 로그인한 관리자의 것인지 확인한다. 오류 처리(try) 밖에서 부르는 것이 안전하다(cookies()가 요청 신호를 쓴다).
export async function isAdmin(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;

  const [expires, signature] = value.split(".");
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires, key))) return false;
  return Number(expires) > Date.now();
}

// 로그인 시도를 늦추기 위한 간단한 실패 횟수 제한(서버 한 대 안에서만 유효한 보조 장치).
const failures = new Map<string, { count: number; until: number }>();
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

export function isLocked(id: string): boolean {
  const entry = failures.get(id);
  return !!entry && entry.count >= MAX_FAILURES && entry.until > Date.now();
}

export function recordFailure(id: string): void {
  const now = Date.now();
  const entry = failures.get(id);
  const count = entry && entry.until > now ? entry.count + 1 : 1;
  failures.set(id, { count, until: now + LOCK_MS });
}

export function clearFailures(id: string): void {
  failures.delete(id);
}
