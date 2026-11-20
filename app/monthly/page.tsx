// Design Ref: §3.3 — 월별 변동사항 화면(`/monthly`). 게시된 요약을 `/api/summaries`에서 가져와 구역별 카드로 보여 준다.
// 자동 수집·요약(작업 12)과 관리자 게시(작업 13)가 만들어지면 실제 요약이 이 화면에 나온다.
import MonthlySummaries from "@/components/monthly/MonthlySummaries";

export default function MonthlyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">최근 현황</h1>
        <p className="mt-1 text-sm text-foreground/70">
          UN 규정 변동과 사업 현황을 국문 요약으로 보여 드립니다. 확인을 마친
          요약만 게시됩니다.
        </p>
      </div>
      <MonthlySummaries />
    </div>
  );
}
