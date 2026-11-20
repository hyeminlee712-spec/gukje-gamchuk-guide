"use client";

// Design Ref: §3.5 — 관리자 화면: 비밀번호 로그인 → 확인 대기 요약(원문 비교 후 [게시]/[반려], 게시 기한 표시) + 저장된 질문 열람.
import { useCallback, useEffect, useState } from "react";

type Pending = {
  id: string;
  category: string;
  title: string;
  summaryKo: string;
  sourceUrl: string;
  asOf: string;
  isSample: boolean;
  detectedAt: string;
  daysLeft: number;
};
type Question = { id: string; question: string; outcome: string; createdAt: string };

const CATEGORY_LABEL: Record<string, string> = {
  un_rules: "UN 규정 변동",
  unep_pipeline: "UNEP Pipeline",
  unfccc_initial_report: "UNFCCC 초기보고서",
  unfccc_methodology: "UNFCCC 방법론",
};
const OUTCOME_LABEL: Record<string, string> = {
  answered: "답변함",
  no_evidence: "근거 못 찾음",
  legal_judgment: "법률 판단(미답변)",
  project_status: "사업 현황(안내)",
};

// 점검 항목: 모두 체크해야 [게시]를 누를 수 있다.
const CHECKLIST = "원문과 비교해 요약에 원문에 없는 내용·숫자가 없음을 확인했습니다";

function deadlineText(daysLeft: number): string {
  if (daysLeft < 0) return `기한 ${-daysLeft}일 초과`;
  if (daysLeft === 0) return "오늘까지";
  return `${daysLeft}일 남음`;
}

export default function AdminPanel() {
  const [auth, setAuth] = useState<"checking" | "out" | "in">("checking");
  const [pending, setPending] = useState<Pending[]>([]);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPending = useCallback(async () => {
    const res = await fetch("/api/admin/summaries");
    if (res.status === 401) {
      setAuth("out");
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.error?.message ?? "목록을 불러오지 못했습니다.");
      setAuth("in");
      return;
    }
    setPending(data.pending);
    setAuth("in");
  }, []);

  useEffect(() => {
    // 처음 열 때 로그인 상태를 확인하고 목록을 가져온다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPending().catch(() => setAuth("out"));
  }, [loadPending]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error?.message ?? "로그인하지 못했습니다.");
        return;
      }
      setPassword("");
      await loadPending();
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setPending([]);
    setQuestions(null);
    setAuth("out");
  }

  async function decide(id: string, action: "publish" | "reject") {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "publish" ? { id, action, checked: true } : { id, action },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error?.message ?? "처리하지 못했습니다.");
        return;
      }
      setMessage(action === "publish" ? "게시했습니다." : "반려했습니다.");
      await loadPending();
    } finally {
      setBusy(false);
    }
  }

  async function loadQuestions() {
    setMessage("");
    const res = await fetch("/api/admin/questions");
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.error?.message ?? "질문을 불러오지 못했습니다.");
      return;
    }
    setQuestions(data.questions);
  }

  if (auth === "checking") return <p className="text-sm text-foreground/70">확인 중…</p>;

  if (auth === "out") {
    return (
      <form onSubmit={login} className="max-w-sm space-y-3">
        <label className="block text-sm font-semibold" htmlFor="admin-password">
          관리자 비밀번호
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-foreground/30 bg-background p-2"
        />
        {message && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || password.length === 0}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
        >
          로그인
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/70">확인 대기 {pending.length}건</p>
        <button onClick={logout} className="text-sm underline">
          로그아웃
        </button>
      </div>

      {message && (
        <p role="status" className="rounded-md border border-foreground/20 p-3 text-sm">
          {message}
        </p>
      )}

      <section aria-labelledby="pending-title" className="space-y-4">
        <h2 id="pending-title" className="text-lg font-bold">
          확인 대기 요약
        </h2>
        {pending.length === 0 && (
          <p className="text-sm text-foreground/70">확인 대기 중인 요약이 없습니다.</p>
        )}
        {pending.map((p) => (
          <article key={p.id} className="space-y-2 rounded-lg border border-foreground/20 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-foreground/10 px-2 py-0.5">
                {CATEGORY_LABEL[p.category] ?? p.category}
              </span>
              <span
                className={
                  p.daysLeft <= 1
                    ? "rounded bg-red-500/15 px-2 py-0.5 font-semibold text-red-700 dark:text-red-300"
                    : "rounded bg-foreground/10 px-2 py-0.5"
                }
              >
                게시 기한 {deadlineText(p.daysLeft)}
              </span>
              {p.isSample && <span className="rounded bg-foreground/10 px-2 py-0.5">샘플</span>}
            </div>
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm leading-relaxed">{p.summaryKo}</p>
            <p className="text-xs text-foreground/70">
              기준일 {p.asOf} · 확인일 {p.detectedAt.slice(0, 10)}{" "}
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                [원문 링크]
              </a>
            </p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!checked[p.id]}
                onChange={(e) => setChecked({ ...checked, [p.id]: e.target.checked })}
                className="mt-1"
              />
              {CHECKLIST}
            </label>
            <div className="flex gap-2">
              <button
                disabled={busy || !checked[p.id]}
                onClick={() => decide(p.id, "publish")}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-40"
              >
                게시
              </button>
              <button
                disabled={busy}
                onClick={() => decide(p.id, "reject")}
                className="rounded-md border border-foreground/40 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                반려
              </button>
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="q-title" className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 id="q-title" className="text-lg font-bold">
            저장된 질문
          </h2>
          <button onClick={loadQuestions} className="text-sm underline">
            {questions ? "새로고침" : "불러오기"}
          </button>
        </div>
        <p className="text-xs text-foreground/70">
          이메일·전화번호를 가린 익명 질문이며 90일 뒤 삭제됩니다. 최근 200건까지 보입니다.
        </p>
        {questions && questions.length === 0 && (
          <p className="text-sm text-foreground/70">저장된 질문이 없습니다.</p>
        )}
        {questions && questions.length > 0 && (
          <ul className="divide-y divide-foreground/10 rounded-lg border border-foreground/20">
            {questions.map((q) => (
              <li key={q.id} className="space-y-1 p-3 text-sm">
                <p>{q.question}</p>
                <p className="text-xs text-foreground/70">
                  {OUTCOME_LABEL[q.outcome] ?? q.outcome} · {q.createdAt.slice(0, 16).replace("T", " ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
