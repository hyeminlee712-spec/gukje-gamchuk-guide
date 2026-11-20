// Design Ref: §3.2 — 답변 카드: 본문 + 출처(문서명·조항·마지막 개정일·원문 링크) + 면책 문구
// 상태별 화면: 정상 답변 / 확인되지 않음(문의 안내) / 사업 현황 안내(월별 변동사항 링크)
import Link from "next/link";
import type { ChatAnswer, ChatNotice } from "@/lib/chat/types";

type AnswerCardProps = {
  answer: ChatAnswer;
  temporary: boolean; // 임시 답변이면 그 사실을 알린다
  status: "answered" | "unverified" | "project_status";
  notice?: ChatNotice; // 문의처·바로 가기 링크
};

export default function AnswerCard({
  answer,
  temporary,
  status,
  notice,
}: AnswerCardProps) {
  return (
    <section
      aria-label="답변"
      className="border border-line bg-white p-4"
    >
      {temporary && (
        <p className="mb-2 inline-block rounded bg-foreground/10 px-2 py-0.5 text-xs">
          임시 답변 · 실제 규정 답변이 아닙니다
        </p>
      )}

      <p className="whitespace-pre-wrap leading-relaxed">{answer.text}</p>

      {status === "answered" && (
        <div className="mt-3 border-t border-foreground/15 pt-3 text-sm">
          <p className="font-semibold">출처</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {answer.sources.map((source) => (
              <li key={source.url}>
                {source.documentName} · {source.article} · 마지막 개정일{" "}
                {source.lastRevised}{" "}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  [원문 링크]
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 문의처·바로 가기: 이 서비스 안의 화면은 Link로, 외부 사이트는 새 창으로 연다 */}
      {notice && (
        <div className="mt-3 border-t border-foreground/15 pt-3 text-sm">
          <p className="font-semibold">{notice.title}</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {notice.links.map((link) => (
              <li key={link.href}>
                {link.href.startsWith("/") ? (
                  <Link href={link.href} className="underline">
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-foreground/70">{answer.disclaimer}</p>
    </section>
  );
}
