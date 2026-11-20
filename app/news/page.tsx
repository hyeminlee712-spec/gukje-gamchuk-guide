// Design Ref: §3.4 — 오늘의 뉴스 화면(`/news`). `/api/news`에서 최신 기사를 가져와 보여 준다.
import NewsList from "@/components/news/NewsList";

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">오늘의 뉴스</h1>
        <p className="mt-1 text-sm text-foreground/70">
          파리협정 제6조·국제감축 관련 주요 뉴스를 평일 오전 8시에 갱신합니다. 기사의 논조나 언론사로 거르지 않으며,
          표시된 내용은 서비스의 입장이 아닙니다. 영문 기사는 제목만 국문으로 옮겼습니다.
        </p>
      </div>
      <NewsList />
    </div>
  );
}
