// Design Ref: §3.5, §4.2 — 관리자: 확인 대기 요약 목록. 게시 기한(확인일 + 7일)까지 남은 날수를 함께 준다.
import { connection } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { selectRows } from "@/lib/db";
import type { SummaryCategory } from "@/lib/summaries/types";

type Row = {
  id: string;
  category: SummaryCategory;
  title: string;
  summary_ko: string;
  source_url: string;
  as_of: string;
  is_sample: boolean;
  created_at: string;
};

const DAY_MS = 24 * 3600 * 1000;
const DEADLINE_DAYS = 7;

export async function GET() {
  await connection();
  if (!(await isAdmin())) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 },
    );
  }

  try {
    const rows = await selectRows<Row>("summaries", {
      select: "id,category,title,summary_ko,source_url,as_of,is_sample,created_at",
      status: "eq.pending",
      order: "created_at.asc", // 기한이 급한(오래된) 것부터
    });

    const now = Date.now();
    const pending = rows.map((r) => {
      const deadline = new Date(r.created_at).getTime() + DEADLINE_DAYS * DAY_MS;
      return {
        id: r.id,
        category: r.category,
        title: r.title,
        summaryKo: r.summary_ko,
        sourceUrl: r.source_url,
        asOf: r.as_of,
        isSample: r.is_sample,
        detectedAt: r.created_at, // 변경을 처음 확인한 시각
        deadline: new Date(deadline).toISOString(),
        daysLeft: Math.ceil((deadline - now) / DAY_MS), // 음수면 기한 초과
      };
    });
    return Response.json({ pending });
  } catch (error) {
    console.error("관리자 요약 읽기 실패:", error instanceof Error ? error.name : error);
    return Response.json(
      { error: { code: "STORE_UNAVAILABLE", message: "목록을 불러오지 못했습니다." } },
      { status: 502 },
    );
  }
}
