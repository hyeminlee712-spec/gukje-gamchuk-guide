// Design Ref: §3 — 홈 화면(`/`): 가로로 넓은 화면에 ① 오늘의 뉴스 + ② UN결정문 | ③ 최근 현황(가. UNEP Pipeline 현황, 나. 초기보고서 및 방법론), ④ 챗봇 순서로 배치한다.
// 디자인: 국제기구 누리집 느낌 — 짙은 남색 소개 띠, 연회색 바탕에 각진 흰 카드, 코너마다 다른 색 윗줄(파랑·주황·초록).
// 기능과 내용은 그대로이고 모양만 바꾼 것이다. "전체 보기"는 따로 열리는 화면(/monthly, /news)으로 연결한다.
import Link from "next/link";
import ChatPanel from "@/components/chat/ChatPanel";
import MonthlySummaries from "@/components/monthly/MonthlySummaries";
import NewsList from "@/components/news/NewsList";

// 코너별 색
const THEMES = {
  blue: { bar: "bg-[#0468b1]", no: "text-[#0468b1]" },
  orange: { bar: "bg-[#e5702a]", no: "text-[#e5702a]" },
  purple: { bar: "bg-[#6b3fa0]", no: "text-[#6b3fa0]" },
  green: { bar: "bg-[#3f7e44]", no: "text-[#3f7e44]" },
} as const;

// 코너 공통 틀: 색 윗줄 + 번호 + 제목 + 설명, 아래에 본문
function Corner({
  id,
  no,
  title,
  theme,
  moreHref,
  scroll,
  className,
  children,
}: {
  id: string;
  no: string;
  title: string;
  theme: keyof typeof THEMES;
  moreHref?: string;
  scroll?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const t = THEMES[theme];
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-20 flex flex-col border border-line bg-white ${className ?? ""}`}
    >
      <div className={`h-1.5 ${t.bar}`} />
      <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-5">
        <div>
          <p aria-hidden className={`text-sm font-extrabold tracking-widest ${t.no}`}>
            {no}
          </p>
          <h2 id={`${id}-title`} className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
            {title}
          </h2>
        </div>
        {moreHref && (
          <Link
            href={moreHref}
            className="shrink-0 pt-1 text-xs font-extrabold tracking-wide text-navy hover:text-undp"
          >
            전체 보기 <span className="text-undp-red">›</span>
          </Link>
        )}
      </div>
      {/* 넓은 화면에서는 코너가 칸 높이를 채우고(아래 선이 맞음), 내용이 길면 코너 안에서만 스크롤한다 */}
      <div className={`flex-1 px-6 pb-6 ${scroll ? "lg:min-h-0 lg:overflow-y-auto" : ""}`}>{children}</div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* 소개 띠 */}
      <section className="relative overflow-hidden bg-navy text-white">
        {/* 장식 원(내용 없음) */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#0468b1]/40" />
        <div aria-hidden className="pointer-events-none absolute right-40 top-20 h-44 w-44 rounded-full bg-[#4a9bd6]/25" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            국제감축 협력사업 주요 현황
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            UN 제도와 국내 법령·부처 지침을 쉬운 국문으로 알려 드립니다. 관련 뉴스와 최신 소식은 아래에서 한눈에 확인하고,
            규정은 챗봇에게 물어보세요.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* 왼쪽 열: ① 오늘의 뉴스 + 그 아래 ② UN결정문 */}
          <div className="flex flex-col gap-6 lg:min-h-[680px]">
            <Corner
              id="news"
              no="01"
              theme="blue"
              title="오늘의 뉴스"
              moreHref="/news"
            >
              <NewsList />
            </Corner>
            {/* ② UN결정문: 파리협정 제6조 관련 결정문·감독기구 결정의 변동 요약 */}
            <Corner
              id="rules"
              no="02"
              className="flex-1"
              theme="purple"
              title="UN결정문"
              moreHref="/monthly"
            >
              <MonthlySummaries sections={[0]} bare />
            </Corner>
          </div>

          {/* 오른쪽 열: ③ 최근 현황 (가. UNEP Pipeline 현황 / 나. 초기보고서 및 방법론) */}
          <Corner
            id="latest"
            no="03"
            className="lg:[contain:size]"
            theme="orange"
            title="최근 현황"
            moreHref="/monthly"
            scroll
          >
            <MonthlySummaries sections={[1, 2]} />
          </Corner>

          {/* ④ 챗봇 (가로 전체) */}
          <Corner
            id="chatbot"
            no="04"
            theme="green"
            title="궁금합니다"
            className="lg:col-span-2"
          >
            <ChatPanel />
          </Corner>
        </div>
      </div>
    </div>
  );
}
