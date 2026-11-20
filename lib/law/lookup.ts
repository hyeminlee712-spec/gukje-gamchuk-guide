// Design Ref: §4.1 ⑥ — 국내 법령·행정규칙(고시·훈령·지침)의 개정일을 법제처 국가법령정보 공개 API에서 가져온다.
// Plan SC: PRD 5번 — 모든 답변에 마지막 개정일을 붙인다. 웹 검색으로는 날짜를 못 잡던 국내 문서를 공식 자료로 채운다.
// 서버 코드에서만 불러온다(LAW_API_OC를 쓴다). 응답의 "상세링크"에는 OC 값이 들어 있어 화면으로 보내지 않는다.

const API_BASE = "https://www.law.go.kr/DRF/lawSearch.do";
const TIMEOUT_MS = 6000; // 법제처 응답을 기다리는 최대 시간
const CACHE_MS = 60 * 60 * 1000; // 같은 문서는 1시간 동안 다시 묻지 않는다

export type LawRevision = {
  // 화면에 보여 줄 마지막 개정일 (예: "2025-11-11 공포(2026-11-12 시행)")
  lastRevised: string;
  // 법제처가 알려 준 정식 이름
  officialName: string;
};

// 이름이 조금 달라도(공백, 가운뎃점, 낫표) 같은 문서로 보도록 다듬는다.
function normalizeName(name: string): string {
  return name
    .replace(/[\s「」『』"'“”‘’]/g, "")
    .replace(/[·ㆍ・•]/g, "")
    .toLowerCase();
}

// "20251111" → "2025-11-11"
function formatDate(raw: unknown): string | null {
  if (typeof raw !== "string" || !/^\d{8}$/.test(raw)) return null;
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

// 결과가 1건이면 객체로, 여러 건이면 배열로 오므로 배열로 통일한다.
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

type CacheEntry = { at: number; value: LawRevision | null };
const cache = new Map<string, CacheEntry>();

async function search(
  oc: string,
  target: "law" | "admrul",
  query: string,
): Promise<Record<string, unknown>[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("OC", oc);
  url.searchParams.set("target", target);
  url.searchParams.set("type", "JSON");
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
  if (!response.ok) return [];

  const data = (await response.json()) as Record<string, unknown>;
  // 법령은 LawSearch.law, 행정규칙은 AdmRulSearch.admrul 아래에 담겨 온다.
  const root = (target === "law" ? data.LawSearch : data.AdmRulSearch) as
    | Record<string, unknown>
    | undefined;
  return toArray(root?.[target] as Record<string, unknown> | Record<string, unknown>[]);
}

// 이름이 아닌 일반 표제(검색 결과 제목에 붙는 말)는 후보에서 뺀다.
const GENERIC_TITLES = new Set(
  ["국가법령정보센터", "조문정보", "법령", "행정규칙", "본문", "조약", "자치법규"].map(
    normalizeName,
  ),
);

// 문서 제목과 주소에서 법령·행정규칙 이름 후보를 뽑는다.
// 예) "행정규칙 > 국제감축사업 사전승인 … 지침" → "국제감축사업 사전승인 … 지침"
//     https://www.law.go.kr/법령/기후위기 …기본법/제72조 → "기후위기 …기본법"
function nameCandidates(documentName: string, url?: string): string[] {
  const list: string[] = [];

  if (url) {
    try {
      const segments = new URL(url).pathname.split("/").map((s) => {
        try {
          return decodeURIComponent(s);
        } catch {
          return s;
        }
      });
      const index = segments.findIndex((s) => s === "법령" || s === "행정규칙");
      if (index >= 0 && segments[index + 1]) list.push(segments[index + 1]);
    } catch {
      // 주소를 읽지 못해도 제목만으로 시도한다
    }
  }

  for (const part of documentName.split(/[>|]/).map((s) => s.trim())) {
    if (part.length >= 4 && !GENERIC_TITLES.has(normalizeName(part))) list.push(part);
  }
  list.push(documentName.trim());

  // 중복 제거, 너무 많이 묻지 않도록 최대 3개까지만 시도한다
  return [...new Set(list.filter(Boolean))].slice(0, 3);
}

// 문서 이름으로 법령 → 행정규칙 순서로 찾아 마지막 개정일을 돌려준다. 못 찾으면 null.
export async function lookupLawRevision(
  documentName: string,
  url?: string,
): Promise<LawRevision | null> {
  const oc = process.env.LAW_API_OC;
  if (!oc) return null; // 인증값이 없으면 조회하지 않는다(개정일은 "확인 불가"로 남는다)

  const candidates = nameCandidates(documentName, url);
  if (candidates.length === 0) return null;

  const cacheKey = candidates.map(normalizeName).join("|");
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

  let result: LawRevision | null = null;
  try {
    for (const candidate of candidates) {
      result = await lookupOne(oc, candidate);
      if (result) break;
    }
  } catch (error) {
    // 인증값이 담길 수 있는 상세 오류는 내보내지 않고 종류만 남긴다. 조회 실패는 답변을 막지 않는다.
    console.error("법령 개정일 조회 실패:", error instanceof Error ? error.name : error);
    return null; // 실패는 캐시하지 않아 다음에 다시 시도한다
  }

  cache.set(cacheKey, { at: Date.now(), value: result });
  return result;
}

// 이름 하나로 법령 → 행정규칙 순서로 찾는다. 이름이 정확히 같은 것만 인정한다.
async function lookupOne(
  oc: string,
  documentName: string,
): Promise<LawRevision | null> {
  const key = normalizeName(documentName);

  // 법령(법률·시행령·시행규칙)부터 찾는다. 법률·시행령은 공포일을 마지막 개정일로 본다.
  const laws = await search(oc, "law", documentName);
  const law = laws.find(
    (item) => normalizeName(String(item["법령명한글"] ?? "")) === key,
  );
  if (law) {
    const promulgated = formatDate(law["공포일자"]);
    const effective = formatDate(law["시행일자"]);
    if (promulgated) {
      return {
        lastRevised: effective
          ? `${promulgated} 공포(${effective} 시행)`
          : `${promulgated} 공포`,
        officialName: String(law["법령명한글"]),
      };
    }
  }

  // 없으면 행정규칙(고시·훈령·지침)에서 찾는다. 행정규칙은 발령일을 마지막 개정일로 본다.
  const rules = await search(oc, "admrul", documentName);
  const rule = rules.find(
    (item) => normalizeName(String(item["행정규칙명"] ?? "")) === key,
  );
  if (rule) {
    const issued = formatDate(rule["발령일자"]);
    const effective = formatDate(rule["시행일자"]);
    if (issued) {
      return {
        lastRevised: effective
          ? `${issued} 발령(${effective} 시행)`
          : `${issued} 발령`,
        officialName: String(rule["행정규칙명"]),
      };
    }
  }

  return null;
}
