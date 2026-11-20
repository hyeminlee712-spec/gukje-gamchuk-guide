// Design Ref: §3.1 — 한 화면(홈)의 세 구역(오늘의 뉴스·UN관련 소식·챗봇)으로 이동하는 메뉴. 구역 순서와 같다.
// 각 구역은 홈 화면 안에 함께 있고, 메뉴를 누르면 그 구역으로 이동한다.
import Link from "next/link";

const MENU_ITEMS = [
  { href: "/#news", label: "오늘의 뉴스", dot: "bg-[#0468b1]" },
  { href: "/#latest", label: "UN관련 소식", dot: "bg-[#e5702a]" },
  { href: "/#chatbot", label: "챗봇", dot: "bg-[#3f7e44]" },
] as const;

export default function MainNav() {
  return (
    <nav aria-label="주요 메뉴">
      <ul className="flex flex-wrap gap-1 sm:gap-3">
        {MENU_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-2 border-b-2 border-transparent px-2 py-2 text-sm font-bold text-navy hover:border-undp hover:text-undp"
            >
              <span aria-hidden className={`inline-block h-2.5 w-2.5 ${item.dot}`} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
