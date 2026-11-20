"use client";

// Design Ref: §3.2 — 챗봇 화면의 동작 부분: 질문 입력창, 질문하기 버튼, 남은 횟수, 답변 카드, 입력 오류·한도 초과 안내.
import { useEffect, useState, type FormEvent } from "react";
import AnswerCard from "@/components/chat/AnswerCard";
import {
  DAILY_QUESTION_LIMIT,
  LIMIT_REACHED_MESSAGE,
  MAX_QUESTION_LENGTH,
} from "@/lib/chat/constants";
import type {
  ChatErrorResponse,
  ChatSuccessResponse,
} from "@/lib/chat/types";
import { INPUT_WARNING } from "@/lib/notices";

export default function ChatPanel() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ChatSuccessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 오늘 남은 질문 수. 아직 모르면(불러오는 중이거나 저장소 오류) null.
  const [remaining, setRemaining] = useState<number | null>(null);

  // 처음 열 때 오늘 남은 횟수를 서버에서 가져온다.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/usage")
      .then((response) => response.json())
      .then((data: { remaining: number | null }) => {
        if (!cancelled) setRemaining(data.remaining);
      })
      .catch(() => {
        // 횟수를 못 가져와도 질문은 할 수 있다(서버가 다시 확인한다).
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        // 서버가 보낸 한국어 안내 문장을 그대로 보여 준다
        const failure = (await response.json()) as ChatErrorResponse;
        setErrorMessage(failure.error.message);
        if (typeof failure.remaining === "number") setRemaining(failure.remaining);
        return;
      }

      const success = (await response.json()) as ChatSuccessResponse;
      setResult(success);
      setRemaining(success.remaining);
    } catch {
      setErrorMessage("지금은 답변할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  const isEmpty = question.trim().length === 0;
  // 한도를 모두 썼으면 질문하기를 막는다
  const isLimitReached = remaining === 0;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <p
          className={
            isLimitReached
              ? "text-sm font-semibold text-red-700 dark:text-red-300"
              : "text-sm text-foreground/70"
          }
        >
          {remaining === null
            ? `하루 ${DAILY_QUESTION_LIMIT}개까지 질문할 수 있습니다.`
            : `오늘 남은 질문: ${remaining} / ${DAILY_QUESTION_LIMIT}`}
        </p>

        <label htmlFor="question" className="sr-only">
          질문 입력 (한국어)
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          placeholder="질문을 입력하세요 (한국어)"
          className="w-full resize-y rounded-lg border border-foreground/30 bg-background p-3 text-sm"
        />

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-foreground/70">{INPUT_WARNING}</p>
          <div className="flex items-center gap-3">
            <span
              className={
                question.length > MAX_QUESTION_LENGTH
                  ? "text-xs font-semibold text-red-600"
                  : "text-xs text-foreground/70"
              }
            >
              {question.length} / {MAX_QUESTION_LENGTH}
            </span>
            <button
              type="submit"
              disabled={isEmpty || isLoading || isLimitReached}
              className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              {isLoading ? "답변 만드는 중…" : "질문하기"}
            </button>
          </div>
        </div>
      </form>

      {/* 입력 오류·한도 초과 안내: 입력창 아래에 보여 준다 (설계 §3.2) */}
      <div aria-live="polite">
        {errorMessage && (
          <p
            role="alert"
            className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
          >
            {errorMessage}
          </p>
        )}
        {/* 한도를 모두 쓴 뒤에는(페이지를 다시 열었을 때도) 계속 안내한다 */}
        {isLimitReached && !errorMessage && (
          <p
            role="status"
            className="rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
          >
            {LIMIT_REACHED_MESSAGE}
          </p>
        )}
      </div>

      {result && (
        <AnswerCard
          answer={result.answer}
          temporary={result.temporary}
          status={result.status}
          notice={result.notice}
        />
      )}
    </div>
  );
}
