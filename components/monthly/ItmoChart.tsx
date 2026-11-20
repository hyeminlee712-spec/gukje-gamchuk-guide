"use client";

// Design Ref: §3.3 — "가. UNEP Pipeline 현황": UNEP Article 6 Pipeline(Global Data)의 "Transferred or received ITMOs" 목록을 막대그래프로 보여 준다.
// 값은 원문 사이트에 적힌 그대로이고(예: 24.9 million), 막대 길이만 그 값에 비례한다(같은 눈금). `GET /api/itmos`에서 가져온다.
import { useEffect, useState } from "react";
import type { ItmoData } from "@/lib/itmos/fetch";

// 국가 이름 국문 표기(원문 영문 이름 옆에 함께 보여 준다). 목록에 없는 나라는 영문 이름만 보여 준다.
const COUNTRY_KO: Record<string, string> = {
  Guyana: "가이아나",
  Uzbekistan: "우즈벡",
  Madagascar: "마다카",
  Switzerland: "스위스",
  Thailand: "태국",
  Ghana: "가나",
  Japan: "일본",
  Maldives: "몰디브",
  Singapore: "싱가포르",
  Sweden: "스웨덴",
  Norway: "노르웨이",
  Rwanda: "르완다",
  Zimbabwe: "짐바브웨",
  Tunisia: "튀니지",
  Palau: "팔라우",
  Malawi: "말라위",
  Cambodia: "캄보디아",
  Mongolia: "몽골",
  Vanuatu: "바누아투",
  Suriname: "수리남",
  "Sri Lanka": "스리랑카",
  Peru: "페루",
  Oman: "오만",
  Mali: "말리",
  Tanzania: "탄자니아",
  "Sierra Leone": "시에라리온",
  Gambia: "감비아",
  Honduras: "온두라스",
  Bhutan: "부탄",
  Bangladesh: "방글라데시",
  Kenya: "케냐",
  Ethiopia: "에티오피아",
  Nigeria: "나이지리아",
  Chile: "칠레",
  Uganda: "우간다",
  Myanmar: "미얀마",
  "Dominican Republic": "도미니카 공화국",
  "Republic of Korea": "대한민국",
  Korea: "대한민국",
};

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: ItmoData };

// 막대 눈금(픽셀): 최댓값을 FULL_PX로 보고 그리되, CAP_PX보다 긴 막대는 CAP_PX로 줄이고 물결 표시를 넣는다(절반 크기).
const FULL_PX = 192;
const CAP_PX = 96;

const ERROR_TEXT = "ITMOs 현황을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

export default function ItmoChart() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/itmos");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setState({ kind: "error", message: data?.error?.message ?? ERROR_TEXT });
        else setState({ kind: "ready", data: data as ItmoData });
      } catch {
        if (!cancelled) setState({ kind: "error", message: ERROR_TEXT });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") return <p className="text-sm text-foreground/70">ITMOs 현황을 불러오는 중…</p>;
  if (state.kind === "error") {
    return (
      <p role="alert" className="border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700">
        {state.message}
      </p>
    );
  }

  const { rows, totalLabel, countryCount, lastUpdated, sourceUrl } = state.data;
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <figure className="border border-line bg-white p-3">
      <figcaption className="mb-3">
        <p className="font-bold text-navy">ITMOs를 이전하거나 받은 국가</p>
        {totalLabel && countryCount !== null && (
          <p className="mt-1 text-sm text-foreground/80">
            {countryCount}개국 · 총 {totalLabel} ITMOs
          </p>
        )}
      </figcaption>

      {/* 세로 막대: 막대 높이는 값에 비례(같은 눈금)한다. 가장 큰 막대는 너무 길어 가운데에 물결(생략) 표시를 넣고 절반 높이로 줄여 그린다.
          값(원문 표기 그대로)은 각 막대 바로 위에 적는다. */}
      <ul className="flex items-end gap-1 sm:gap-2" aria-label="국가별 ITMOs 막대그래프">
        {rows.map((row) => {
          const ko = COUNTRY_KO[row.country];
          // 눈금: 최댓값이 FULL_PX일 때의 높이. CAP_PX를 넘는 막대는 CAP_PX로 줄이고 물결 표시를 넣는다.
          const scaled = Math.max((row.value / max) * FULL_PX, 3);
          const cut = scaled > CAP_PX;
          const height = cut ? CAP_PX : scaled;
          return (
            <li key={row.country} className="flex min-w-0 flex-1 flex-col items-center">
              {/* 막대 영역: 아래 기준선에 붙고, 값 글자와 막대가 위로 쌓인다 */}
              <div className="flex w-full flex-col items-center justify-end border-b border-line" style={{ height: `${CAP_PX + 40}px` }}>
                <span className="mb-1 text-center text-[11px] font-extrabold leading-tight tabular-nums text-[#c4247a] sm:text-xs">
                  {row.label}
                </span>
                <span aria-hidden className="relative block w-3/5 max-w-10 bg-[#c4247a]" style={{ height: `${height}px` }}>
                  {cut && (
                    // 막대 가운데의 물결(생략) 표시: 흰 물결 띠로 막대를 끊어 보이게 한다.
                    <svg
                      viewBox="0 0 40 10"
                      preserveAspectRatio="none"
                      className="absolute -left-1 top-1/2 h-3 w-[calc(100%+8px)] -translate-y-1/2"
                    >
                      <path d="M0 5 Q5 0 10 5 T20 5 T30 5 T40 5" fill="none" stroke="#ffffff" strokeWidth="6" />
                    </svg>
                  )}
                </span>
              </div>
              <span className="mt-2 w-full text-center text-[11px] font-bold leading-tight [overflow-wrap:anywhere] [word-break:break-all]">
                {ko ?? row.country}
                {ko && <span className="mt-0.5 block text-[8px] font-normal tracking-tighter text-foreground/60 [word-break:normal]">{row.country}</span>}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-foreground/70">
        {lastUpdated ? `원문 갱신 ${lastUpdated} · ` : ""}출처: UNEP Article 6 Pipeline{" "}
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          [원문 링크]
        </a>
      </p>
    </figure>
  );
}
