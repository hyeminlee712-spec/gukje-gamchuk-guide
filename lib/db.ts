// Design Ref: §11.1 — 저장소(Supabase) 접속. 서버 코드에서만 불러온다(service_role 키를 쓴다).
// 키는 브라우저로 보내지 않고, 오류 메시지에도 키나 주소 값을 담지 않는다.

export class DbConfigError extends Error {
  constructor() {
    super("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env에 없습니다.");
    this.name = "DbConfigError";
  }
}

export class DbRequestError extends Error {
  constructor(status: number) {
    super(`저장소 요청이 실패했습니다 (HTTP ${status}).`);
    this.name = "DbRequestError";
  }
}

// 표에서 줄을 읽는다. 조건은 Supabase 주소 규칙을 따른다(예: { status: "eq.published", order: "as_of.desc" }).
export async function selectRows<T>(
  table: string,
  params: Record<string, string>,
): Promise<T[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DbConfigError();

  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new DbRequestError(response.status);
  return (await response.json()) as T[];
}

// 표에 줄을 추가한다. 고유 조건(unique)이 겹치는 줄은 조용히 건너뛰고, 실제로 새로 들어간 줄 수를 돌려준다.
export async function insertRowsIgnoreDuplicates(
  table: string,
  rows: Record<string, unknown>[],
  // 겹침을 판단하는 열 이름(고유 조건과 같아야 한다). 없으면 기본키만 본다.
  onConflict: string,
): Promise<number> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DbConfigError();
  if (rows.length === 0) return 0;

  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // 겹치는 줄은 무시하고, 새로 들어간 줄만 돌려받는다.
      Prefer: "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new DbRequestError(response.status);
  const inserted = (await response.json()) as unknown[];
  return inserted.length;
}

// 조건에 맞는 줄을 바꾼다(예: filter { id: "eq.…", status: "eq.pending" }). 실제로 바뀐 줄 수를 돌려준다.
export async function updateRows(
  table: string,
  filter: Record<string, string>,
  values: Record<string, unknown>,
): Promise<number> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DbConfigError();
  // 조건 없이 전부 바꾸는 일을 막는다.
  if (Object.keys(filter).length === 0) throw new Error("수정 조건이 필요합니다.");

  const query = new URLSearchParams(filter).toString();
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(values),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new DbRequestError(response.status);
  return ((await response.json()) as unknown[]).length;
}

// 저장소에 만들어 둔 함수를 부른다(예: consume_daily_question). 응답 본문(JSON)을 돌려준다.
export async function callRpc<T>(
  functionName: string,
  args: Record<string, unknown>,
): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DbConfigError();

  const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new DbRequestError(response.status);
  // 반환값이 없는 함수(void)는 본문이 비어 있을 수 있다.
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
