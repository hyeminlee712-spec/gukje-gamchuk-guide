// Design Ref: §3.5, §6 — `GET /api/admin/questions`: 저장된 익명 질문 열람(서비스 개선 목적, 관리자만). 최근 200건.
import { connection } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { selectRows } from "@/lib/db";

type Row = { id: string; question: string; outcome: string; created_at: string };

export async function GET() {
  await connection();
  if (!(await isAdmin())) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 },
    );
  }

  try {
    const rows = await selectRows<Row>("questions", {
      select: "id,question,outcome,created_at",
      order: "created_at.desc",
      limit: "200",
    });
    return Response.json({
      questions: rows.map((r) => ({
        id: r.id,
        question: r.question,
        outcome: r.outcome,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    console.error("관리자 질문 읽기 실패:", error instanceof Error ? error.name : error);
    return Response.json(
      { error: { code: "STORE_UNAVAILABLE", message: "목록을 불러오지 못했습니다." } },
      { status: 502 },
    );
  }
}
