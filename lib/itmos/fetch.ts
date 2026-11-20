// Design Ref: §4.2 — UNEP Article 6 Pipeline(Global Data)의 "Transferred or received ITMOs" 목록을 그대로 가져온다.
// AI를 쓰지 않는다: 페이지의 HTML에 들어 있는 표를 코드가 그대로 읽는다(국가 이름과 화면에 적힌 ITMOs 값). 숫자를 고치거나 추정하지 않는다.
// 서버 코드에서만 불러온다.
export const ITMOS_SOURCE_URL = "https://article6pipeline.unepccc.org/global-data";

export type ItmoRow = {
  country: string; // 국가 이름(원문 그대로)
  label: string; // 화면에 적힌 값(예: "24.9 million")
  value: number; // 막대 길이를 정하려고 label을 숫자로 바꾼 값
};

export type ItmoData = {
  rows: ItmoRow[];
  totalLabel: string | null; // 예: "35.6 million"
  countryCount: number | null; // 예: 8
  lastUpdated: string | null; // 예: "5 November 2026"
  sourceUrl: string;
};

// "24.9 million" → 24900000, "63.3 thousand" → 63300, "433" → 433. 읽을 수 없으면 null.
export function parseItmoLabel(label: string): number | null {
  const m = label.trim().match(/^([\d.,]+)\s*(billion|million|thousand)?$/i);
  if (!m) return null;
  const base = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(base)) return null;
  const unit = (m[2] ?? "").toLowerCase();
  const scale = unit === "billion" ? 1e9 : unit === "million" ? 1e6 : unit === "thousand" ? 1e3 : 1;
  return base * scale;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 페이지 HTML에서 목록을 읽는다(순수 함수라 따로 시험할 수 있다).
export function parseItmoHtml(html: string): ItmoData {
  const start = html.indexOf("Countries that transferred or received ITMOs");
  if (start < 0) throw new Error("ITMOs 목록을 찾지 못했습니다.");
  // 다른 목록(다음 창)이 시작되기 전까지만 본다.
  const next = html.indexOf('class="agreements-modal-overlay"', start);
  const block = html.slice(start, next > start ? next : start + 20000);

  const rows: ItmoRow[] = [];
  const rowRe =
    /<a class="col-country"[^>]*>\s*([^<]+?)\s*<img[^>]*>\s*<\/a>\s*<div class="col-agreements">\s*([^<]+?)\s*<\/div>/g;
  for (const m of block.matchAll(rowRe)) {
    const country = decodeEntities(m[1]);
    const label = decodeEntities(m[2]);
    const value = parseItmoLabel(label);
    if (country && value !== null) rows.push({ country, label, value });
  }
  if (rows.length === 0) throw new Error("ITMOs 목록의 줄을 읽지 못했습니다.");

  const summary = block.match(/<p>\s*<span>([^<]+)<\/span>\s*ITMOs transactions involving\s*<span>(\d+)<\/span>/);
  const updated = html.match(/Last updated\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/);

  return {
    rows,
    totalLabel: summary ? decodeEntities(summary[1]) : null,
    countryCount: summary ? Number(summary[2]) : null,
    lastUpdated: updated ? updated[1] : null,
    sourceUrl: ITMOS_SOURCE_URL,
  };
}

// 한 번 가져온 결과를 잠시 기억해 두어 방문자가 많아도 원문 사이트에 자주 요청하지 않는다.
const CACHE_MS = 6 * 60 * 60 * 1000;
let cache: { at: number; data: ItmoData } | null = null;

export async function fetchTransferredItmos(): Promise<ItmoData> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

  const response = await fetch(ITMOS_SOURCE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; gukje-gamchuk-guide)", "Accept-Language": "en" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`원문 사이트 응답 오류(HTTP ${response.status})`);

  const data = parseItmoHtml(await response.text());
  cache = { at: Date.now(), data };
  return data;
}
