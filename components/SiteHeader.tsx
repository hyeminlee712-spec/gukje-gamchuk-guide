// Design Ref: §3.1 — 모든 화면 위에 고정되어 보이는 공통 머리글. 왼쪽 위에 국가기후위기대응위원회 로고와 서비스 이름, 오른쪽에 메뉴를 둔다.
import Image from "next/image";
import Link from "next/link";
import MainNav from "@/components/MainNav";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-4" aria-label="국제감축 협력사업 주요 현황 홈">
          <Image
            src="/logo-pccr.png"
            alt="국가기후위기대응위원회 Presidential Commission on Climate Crisis Response"
            width={240}
            height={48}
            priority
            className="h-9 w-auto sm:h-10"
          />
          <span aria-hidden className="hidden h-7 w-px bg-line sm:block" />
          <span className="hidden whitespace-nowrap text-lg font-extrabold tracking-tight text-navy sm:block">국제감축 협력사업 주요 현황</span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
