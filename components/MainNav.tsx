"use client";

// Design Ref: §3.1 — 세 화면으로 이동하는 메뉴. 지금 보고 있는 화면을 강조하려고 클라이언트 컴포넌트로 만든다.
import Link from "next/link";
import { usePathname } from "next/navigation";

// 메뉴 항목: 화면 이름과 주소
const MENU_ITEMS = [
  { href: "/", label: "챗봇" },
  { href: "/monthly", label: "월별 변동사항" },
  { href: "/news", label: "오늘의 뉴스" },
] as const;

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요 메뉴">
      <ul className="flex flex-wrap gap-1 sm:gap-2">
        {MENU_ITEMS.map((item) => {
          // 현재 주소와 같으면 선택된 메뉴로 표시한다
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "block rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background"
                    : "block rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
