import type { Metadata } from "next";
import { Geist, Geist_Mono, Nanum_Gothic } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 본문 글꼴: 나눔고딕(한글 글자 조각은 화면에 필요한 것만 내려받는다)
const nanumGothic = Nanum_Gothic({
  variable: "--font-nanum",
  weight: ["400", "700", "800"],
  preload: false,
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "국제감축 협력사업 주요 현황",
  description:
    "국제감축 관련 UN 제도, 국내 법령·지침을 쉬운 국문으로 알려 주는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${nanumGothic.variable} h-full antialiased`}
    >
      {/* Design Ref: §3.1 — 머리글(메뉴) / 선택한 화면 / 이용 안내 순서의 공통 틀 */}
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
