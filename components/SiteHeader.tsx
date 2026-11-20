// Design Ref: §3.1 — 모든 화면 위에 고정되어 보이는 공통 머리글(서비스 이름 + 메뉴). 국제기구 누리집처럼 연회색 띠에 파란 표지 상자를 둔다.
import Link from "next/link";
import MainNav from "@/components/MainNav";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center bg-undp text-lg font-extrabold text-white"
          >
            국
          </span>
          <span className="text-lg font-extrabold tracking-tight text-navy">국제감축 길잡이</span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
