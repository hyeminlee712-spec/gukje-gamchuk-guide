// Design Ref: §6 — `GET /api/itmos`: UNEP Article 6 Pipeline의 "Transferred or received ITMOs" 국가별 목록(막대그래프용). 누구나 읽을 수 있다.
import { connection } from "next/server";
import { fetchTransferredItmos } from "@/lib/itmos/fetch";

export async function GET() {
  // 요청 때마다 실행한다(원문은 6시간 동안 기억해 둔다). 요청 신호를 삼키지 않도록 오류 처리(try) 밖에 둔다.
  await connection();

  try {
    return Response.json(await fetchTransferredItmos());
  } catch (error) {
    console.error("ITMOs 읽기 실패:", error instanceof Error ? error.name : error);
    return Response.json(
      { error: { code: "ITMOS_UNAVAILABLE", message: "ITMOs 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." } },
      { status: 502 },
    );
  }
}
