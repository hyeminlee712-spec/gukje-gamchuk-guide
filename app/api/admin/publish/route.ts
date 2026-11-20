// Design Ref: §3.5, §6 — `POST /api/admin/publish`: 확인 대기 요약을 게시하거나 반려한다(관리자만).
// 게시하려면 "원문과 비교해 원문에 없는 내용·숫자가 없음을 확인했다"는 점검(checked)이 필요하다.
import { z } from "zod";
import { isAdmin } from "@/lib/admin/auth";
import { updateRows } from "@/lib/db";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ id: z.uuid(), action: z.literal("publish"), checked: z.literal(true) }),
  z.object({ id: z.uuid(), action: z.literal("reject") }),
]);

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail(400, "INVALID_INPUT", "요청이 올바르지 않습니다. 게시하려면 원문 비교 확인에 체크해 주세요.");
  }
  const body = parsed.data;

  try {
    // '확인 대기' 상태인 줄만 바꾼다(이미 게시·반려된 것은 건드리지 않는다).
    const values =
      body.action === "publish"
        ? { status: "published", published_at: new Date().toISOString() }
        : { status: "rejected", published_at: null };
    const changed = await updateRows(
      "summaries",
      { id: `eq.${body.id}`, status: "eq.pending" },
      values,
    );
    if (changed === 0) return fail(404, "NOT_PENDING", "확인 대기 중인 요약이 아닙니다.");
    return Response.json({ ok: true, status: values.status });
  } catch (error) {
    console.error("요약 게시·반려 실패:", error instanceof Error ? error.name : error);
    return fail(502, "STORE_UNAVAILABLE", "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
