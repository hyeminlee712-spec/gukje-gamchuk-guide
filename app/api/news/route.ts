// Design Ref: §6 — `GET /api/news`: 오늘의 뉴스(최신순 최대 10건). 누구나 읽을 수 있다.
import { connection } from "next/server";
import { listLatestNews } from "@/lib/news/repo";

export async function GET() {
  // 요청마다 저장소에서 읽는다. 요청 신호를 삼키지 않도록 오류 처리(try) 밖에 둔다.
  await connection();

  try {
    return Response.json({ news: await listLatestNews(10) });
  } catch (error) {
    console.error("뉴스 읽기 실패:", error instanceof Error ? error.name : error);
    return Response.json(
      { error: { code: "NEWS_UNAVAILABLE", message: "뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." } },
      { status: 502 },
    );
  }
}
