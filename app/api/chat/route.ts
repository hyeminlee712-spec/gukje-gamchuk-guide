// Design Ref: §6 — `POST /api/chat`: 질문을 받아 답변을 돌려주는 서버 코드.
// 흐름(§4.1): ② 질문 확인 → ③ 하루 5개 제한 → 질문 분류(법률 판단·사업 현황) → ④ 공식 사이트 검색 → ⑤ 근거 기반 답변 → ⑥ 규칙 검증 → ⑦ 출력
// 횟수 차감 규칙(§8): 입력 오류는 차감하지 않고, AI 서비스 오류는 차감했다가 돌려준다. 그 밖의 답변("확인되지 않음" 포함)은 차감한다.
// 질문 저장(작업 10): 이메일·전화번호를 가린 질문만, 처리 결과와 함께 익명으로 저장한다. 오류로 끝난 질문과 한도 초과·입력 오류 질문은 저장하지 않는다.
import { composeAnswer } from "@/lib/answer/compose";
import { MissingApiKeyError } from "@/lib/ai";
import { classifyQuestion } from "@/lib/chat/classify";
import { DISCLAIMER, LIMIT_REACHED_MESSAGE } from "@/lib/chat/constants";
import { CONTACT_LINKS } from "@/lib/chat/contacts";
import type {
  ChatErrorResponse,
  ChatSuccessResponse,
} from "@/lib/chat/types";
import { chatRequestSchema } from "@/lib/chat/validate";
import { maskPersonalInfo } from "@/lib/privacy/mask";
import { saveQuestion } from "@/lib/questions/store";
import { searchOfficialSources } from "@/lib/search/search";
import { GLOBAL_DAILY_LIMIT, IP_DAILY_LIMIT } from "@/lib/chat/constants";
import {
  GLOBAL_BUCKET_KEY,
  consumeBucket,
  consumeQuestion,
  getOrCreateBrowserId,
  hashBrowserId,
  ipBucketKey,
  refundQuestion,
} from "@/lib/usage/usage";

// 검색과 답변을 합쳐 시간이 걸리므로 넉넉히 기다린다(초).
export const maxDuration = 60;

// 오류 응답은 설계 문서(§6)의 한 가지 모양으로 통일한다.
function errorResponse(
  code: string,
  message: string,
  status: number,
  remaining?: number,
) {
  const body: ChatErrorResponse = { error: { code, message }, remaining };
  return Response.json(body, { status });
}

// "확인되지 않음" 답변 + 문의 안내 (근거를 못 찾았거나 법률 판단을 물은 경우)
function unverifiedResponse(
  reason: "no_evidence" | "legal_judgment",
  remaining: number,
): Response {
  const detail =
    reason === "legal_judgment"
      ? "이 질문은 개별 사업의 승인·적법 여부 같은 법률 판단이라 이 서비스가 답할 수 없습니다."
      : "공식 공개 사이트에서 질문에 답할 수 있는 근거를 찾지 못했습니다.";

  const body: ChatSuccessResponse = {
    status: "unverified",
    answer: {
      text: `확인되지 않음\n\n${detail} 아래의 해당 부처나 공식 사이트에 문의해 주세요.`,
      sources: [],
      disclaimer: DISCLAIMER,
    },
    notice: { title: "문의처 (공식 사이트)", links: CONTACT_LINKS },
    remaining,
    temporary: false,
  };
  return Response.json(body);
}

// 사업 진행현황을 묻는 질문: 월별 변동사항 화면으로 안내한다.
function projectStatusResponse(remaining: number): Response {
  const body: ChatSuccessResponse = {
    status: "project_status",
    answer: {
      text: "사업 진행현황은 챗봇이 아니라 '월별 변동사항' 화면에서 확인해 주세요.\n\n이 화면에서 UNEP Pipeline 사업 현황과 UNFCCC 초기보고서·방법론 현황을 국문 요약으로 볼 수 있습니다.",
      sources: [],
      disclaimer: DISCLAIMER,
    },
    notice: {
      title: "바로 가기",
      links: [{ label: "월별 변동사항 화면", href: "/monthly" }],
    },
    remaining,
    temporary: false,
  };
  return Response.json(body);
}

// 이 요청에서 차감한 묶음(전체·IP·브라우저)을 모두 돌려준다.
async function refundAll(keys: string[]): Promise<void> {
  for (const key of keys) await refundQuestion(key);
}

// 처리가 제한 시간 안에 끝나지 않으면 오류로 보고 끝낸다(60초 강제 종료로 횟수가 안 돌아가는 것을 막는다).
const PIPELINE_DEADLINE_MS = 50_000;
function withDeadline<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("PipelineTimeout")), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// ④~⑦: 질문 분류 → 검색 → 답변 → 규칙 검증 → 저장
async function runPipeline(question: string, remaining: number): Promise<Response> {
  // 4) 질문 분류: 법률 판단·사업 현황 질문은 검색하지 않고 바로 안내한다
  // 처리 결과가 정해지면 가린 질문을 익명으로 저장한다(서비스 개선 목적, 90일 후 삭제).
  const category = await classifyQuestion(question);
  if (category === "legal_judgment") {
    await saveQuestion(question, "legal_judgment");
    return unverifiedResponse("legal_judgment", remaining);
  }
  if (category === "project_status") {
    await saveQuestion(question, "project_status");
    return projectStatusResponse(remaining);
  }

  // 5) 공식 공개 사이트 안에서 검색
  const search = await searchOfficialSources(question);
  if (!search.found) {
    await saveQuestion(question, "no_evidence");
    return unverifiedResponse("no_evidence", remaining);
  }

  // 6) 찾은 자료만 근거로 답변 만들기 + 규칙 검증 (500자, 출처)
  const composed = await composeAnswer(question, search);
  if (composed.status === "unverified") {
    await saveQuestion(question, "no_evidence");
    return unverifiedResponse("no_evidence", remaining);
  }

  await saveQuestion(question, "answered");
  const result: ChatSuccessResponse = {
    status: "answered",
    answer: composed.answer,
    remaining,
    temporary: false,
  };
  return Response.json(result);
}

export async function POST(request: Request) {
  // 1) 요청 본문 읽기
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_INPUT", "질문을 입력해 주세요.", 400);
  }

  // 2) 질문 확인 (빈 질문, 300자 초과, 한글 없음이면 횟수를 쓰지 않고 AI도 부르지 않고 끝낸다)
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "질문을 확인해 주세요.";
    return errorResponse("INVALID_INPUT", message, 400);
  }
  // 이메일·전화번호 등은 외부 AI 서비스로 보내기 전에 가린다. 이후 모든 처리와 저장에는 가린 질문만 쓴다.
  const question = maskPersonalInfo(parsed.data.question);

  // 3) 하루 질문 5개 제한: 브라우저 구분 값(없으면 새로 만든다)의 해시로 오늘 횟수를 센다.
  // 쿠키를 빼고 보내는 우회를 막기 위해 접속 주소(IP) 묶음과 서비스 전체 묶음의 상한도 함께 센다.
  const browserHash = hashBrowserId(await getOrCreateBrowserId());
  const ipKey = ipBucketKey(request);
  // 이 요청에서 실제로 차감한 묶음(오류 시 돌려줄 대상)
  const consumed: string[] = [];
  let remaining: number;
  try {
    // 다른 사이트에서 이 서버 코드를 가져다 쓰는 요청은 받지 않는다(같은 사이트에서 온 요청만 허용).
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return errorResponse("FORBIDDEN_ORIGIN", "허용되지 않은 요청입니다.", 403);
    }

    if (!(await consumeBucket(GLOBAL_BUCKET_KEY, GLOBAL_DAILY_LIMIT))) {
      return errorResponse(
        "SERVICE_BUSY",
        "오늘 서비스 전체 질문 한도에 도달했습니다. 내일 다시 이용해 주세요.",
        503,
      );
    }
    consumed.push(GLOBAL_BUCKET_KEY);
    if (!(await consumeBucket(ipKey, IP_DAILY_LIMIT))) {
      await refundAll(consumed);
      return errorResponse("DAILY_LIMIT_EXCEEDED", LIMIT_REACHED_MESSAGE, 429, 0);
    }
    consumed.push(ipKey);

    const usage = await consumeQuestion(browserHash);
    if (!usage.allowed) {
      // 한도를 넘으면 AI를 부르지 않는다(비용 방지). 앞서 센 묶음은 돌려준다.
      await refundAll(consumed);
      return errorResponse("DAILY_LIMIT_EXCEEDED", LIMIT_REACHED_MESSAGE, 429, 0);
    }
    consumed.push(browserHash);
    remaining = usage.remaining;
  } catch (error) {
    await refundAll(consumed);
    // 횟수를 셀 수 없으면 비용을 막기 위해 질문을 받지 않는다(저장소 상세 오류는 내보내지 않는다).
    console.error("질문 횟수 확인 실패:", error instanceof Error ? error.name : error);
    return errorResponse(
      "USAGE_UNAVAILABLE",
      "지금은 질문을 받을 수 없습니다. 잠시 후 다시 시도해 주세요.",
      503,
    );
  }

  try {
    // 전체 처리에 제한 시간을 둔다(실행 제한 60초보다 먼저 끝내야 횟수를 돌려줄 수 있다).
    return await withDeadline(runPipeline(question, remaining), PIPELINE_DEADLINE_MS);
  } catch (error) {
    // AI·검색 서비스 오류는 사용자 잘못이 아니므로 쓴 횟수를 돌려준다.
    let restored = remaining;
    try {
      await refundAll(consumed);
      restored = remaining + 1;
    } catch {
      // 돌려주기에 실패해도 오류 응답은 그대로 보낸다
    }

    if (error instanceof MissingApiKeyError) {
      // 설정 이름 같은 내부 정보는 사용자에게 보여 주지 않고 서버 로그에만 남긴다.
      console.error("챗봇 답변 실패: OpenAI 키가 설정되지 않았습니다.");
      return errorResponse(
        "ANSWER_FAILED",
        "지금은 답변할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        500,
        restored,
      );
    }
    // 키 값이 담길 수 있는 상세 오류는 내보내지 않고, 종류만 남긴다.
    console.error("챗봇 답변 실패:", error instanceof Error ? error.name : error);
    return errorResponse(
      "ANSWER_FAILED",
      "지금은 답변할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      502,
      restored,
    );
  }
}
