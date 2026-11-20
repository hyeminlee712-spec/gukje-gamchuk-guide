// Design Ref: §3 — 홈 화면(`/`): 가로로 넓은 화면에 ① 오늘의 뉴스 + 가. 규정 및 지침 등 | ② 최신 뉴스(나·다), ③ 챗봇 순서로 배치한다.
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
  green: { bar: "bg-[#3f7e44]", no: "text-[#3f7e44]" },
} as const;

// 코너 공통 틀: 색 윗줄 + 번호 + 제목 + 설명, 아래에 본문
function Corner({
  id,
  no,
  title,
  description,
  theme,
  moreHref,
  scroll,
  className,
  children,
}: {
  id: string;
  no: string;
  title: string;
  description: string;
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
      className={`scroll-mt-20 border border-line bg-white ${className ?? ""}`}
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
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">{description}</p>
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
      {/* 넓은 화면에서는 코너 안에서만 스크롤해 두 열의 높이를 맞춘다 */}
      <div className={`px-6 pb-6 ${scroll ? "lg:max-h-[720px] lg:overflow-y-auto" : ""}`}>{children}</div>
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
            국제감축 길잡이
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            UN 제도와 국내 법령·부처 지침을 쉬운 국문으로 알려 드립니다. 관련 뉴스와 최신 소식은 아래에서 한눈에 확인하고,
            규정은 챗봇에게 물어보세요.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* 왼쪽 열: ① 오늘의 뉴스 + 그 아래 최신 뉴스의 "가. 규정 및 지침 등" */}
          <div className="space-y-6">
            <Corner
              id="news"
              no="01"
              theme="blue"
              title="오늘의 뉴스"
              description="파리협정 제6조·국제감축 관련 뉴스를 평일 오전 8시에 갱신합니다. 논조나 언론사로 거르지 않으며, 표시된 내용은 서비스의 입장이 아닙니다."
              moreHref="/news"
            >
              <NewsList />
            </Corner>
            {/* 최신 뉴스 ②의 가 구역을 왼쪽 열 아래에 둔다 */}
            <div id="rules" className="scroll-mt-20 lg:max-h-[720px] lg:overflow-y-auto">
              <MonthlySummaries sections={[0]} />
            </div>
          </div>

          {/* 오른쪽 열: ② 최신 뉴스 (나. UNEP Pipeline 현황 / 다. 초기보고서 및 방법론) */}
          <Corner
            id="latest"
            no="02"
            theme="orange"
            title="최신 뉴스"
            description="UN 규정 변동과 사업 현황을 국문 요약으로 보여 드립니다. 확인을 마친 요약만 게시됩니다. (가. 규정 및 지침 등은 왼쪽 오늘의 뉴스 아래에 있습니다.)"
            moreHref="/monthly"
            scroll
          >
            <MonthlySummaries sections={[1, 2]} />
          </Corner>

          {/* ③ 챗봇 (가로 전체) */}
          <Corner
            id="chatbot"
            no="03"
            theme="green"
            title="챗봇 — 규정 질문하기"
            description="국제감축 규정(UN 제도, 국내 법령·지침)을 쉬운 국문으로 알려 드립니다."
            className="lg:col-span-2"
          >
            <ChatPanel />
          </Corner>
        </div>
      </div>
    </div>
  );
}
