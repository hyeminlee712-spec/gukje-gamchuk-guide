// Design Ref: §7 — AI 서비스(OpenAI) 연결. 키는 서버 코드에서만 읽고 브라우저로 보내지 않는다.
// 이 파일은 서버 코드(API 경로, 서버 컴포넌트)에서만 불러온다. 화면(클라이언트) 코드에서 불러오지 않는다.
import OpenAI from "openai";

// 연결 확인용으로 쓰는 가장 작은 모델. 실제 답변용 모델은 작업 6에서 정한다.
export const AI_CHECK_MODEL = "gpt-5.4-nano";

// 키가 없을 때 사용자에게 키 값을 노출하지 않고 이유만 알리기 위한 오류
export class MissingApiKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY가 .env에 없습니다.");
    this.name = "MissingApiKeyError";
  }
}

let cachedClient: OpenAI | null = null;

// OpenAI 호출 도구를 한 번만 만들어 재사용한다.
export function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();

  // 응답이 늦어지면 기다리지 않고 오류로 처리한다(실행 제한 시간 안에 끝내기 위해, CHECK.md 높음 4)
  cachedClient = new OpenAI({ apiKey, timeout: 25_000, maxRetries: 1 });
  return cachedClient;
}
