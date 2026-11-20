// Design Ref: §3.1 — 모든 화면 위에 보이는 공통 머리글(서비스 이름 + 메뉴)
import Link from "next/link";
import MainNav from "@/components/MainNav";

export default function SiteHeader() {
  return (
    <header className="border-b border-foreground/15">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-bold">
          국제감축 길잡이
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
