// Design Ref: §3.2, §5 daily_usage — 하루 질문 5개 제한.
// Plan SC: 작업 9 — 한 브라우저당 하루 5개(한국시간 자정에 초기화), 브라우저에 무작위 값을 저장해 구분하고 IP는 쓰지 않는다.
// 서버 코드에서만 불러온다.
import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { DAILY_QUESTION_LIMIT } from "@/lib/chat/constants";
import { callRpc } from "@/lib/db";

const BROWSER_COOKIE = "browser_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 한국시간 기준 오늘 날짜 (예: "2026-11-20"). 자정이 지나면 날짜가 바뀌어 횟수가 새로 시작된다.
export function kstToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(
    new Date(),
  );
}

// 브라우저 값(무작위 UUID)을 해시로 바꿔 저장한다. 원래 값은 저장소에 남기지 않는다.
export function hashBrowserId(browserId: string): string {
  return createHash("sha256").update(browserId).digest("hex");
}

// 브라우저에 저장된 구분 값을 읽는다. 없거나 모양이 이상하면 null.
export async function readBrowserId(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(BROWSER_COOKIE)?.value;
  return value && UUID_PATTERN.test(value) ? value : null;
}

// 구분 값이 없으면 새로 만들어 브라우저에 저장한다(질문을 받을 때만 호출한다).
export async function getOrCreateBrowserId(): Promise<string> {
  const existing = await readBrowserId();
  if (existing) return existing;

  const created = randomUUID();
  const store = await cookies();
  store.set(BROWSER_COOKIE, created, {
    httpOnly: true, // 화면 쪽 코드에서 읽지 못하게 한다
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return created;
}

export type ConsumeResult = { allowed: boolean; remaining: number };

// 질문 1개를 쓴다. 한도를 넘었으면 allowed가 false이다.
export async function consumeQuestion(browserHash: string): Promise<ConsumeResult> {
  const rows = await callRpc<ConsumeResult[]>("consume_daily_question", {
    p_hash: browserHash,
    p_date: kstToday(),
    p_limit: DAILY_QUESTION_LIMIT,
  });
  const row = rows[0];
  return { allowed: Boolean(row?.allowed), remaining: Number(row?.remaining ?? 0) };
}

// AI 오류처럼 사용자 잘못이 아닌 실패일 때 질문 1개를 돌려준다.
export async function refundQuestion(browserHash: string): Promise<void> {
  await callRpc<null>("refund_daily_question", {
    p_hash: browserHash,
    p_date: kstToday(),
  });
}

// 오늘 남은 질문 수를 본다.
export async function getRemainingQuestions(browserHash: string): Promise<number> {
  const remaining = await callRpc<number>("get_daily_remaining", {
    p_hash: browserHash,
    p_date: kstToday(),
    p_limit: DAILY_QUESTION_LIMIT,
  });
  return Number(remaining);
}
