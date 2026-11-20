// Design Ref: §3.1 — 모든 화면 아래에 항상 보이는 이용 안내
// Plan SC: PRD 7번 — 법적 효력 없음, 질문 저장의 사실·목적·보관 기간, 외부 AI 전달, 개인정보 입력 금지를 알린다.
// 문구는 lib/notices.ts에서 가져온다. 짙은 남색 바닥 띠로 보여 준다.
import { USAGE_NOTICES } from "@/lib/notices";

export default function SiteFooter() {
  return (
    <footer aria-label="이용 안내" className="mt-auto bg-navy text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 text-sm leading-relaxed text-white/80">
        <p className="mb-2 text-base font-extrabold text-white">이용 안내</p>
        <ul className="list-disc space-y-1 pl-5">
          {USAGE_NOTICES.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
