// Design Ref: §4.1 ② — 질문 확인: 빈 질문, 길이(최대 300자), 한국어 여부(한글이 포함되면 받음)를 검사한다.
import { z } from "zod";
import { MAX_QUESTION_LENGTH } from "@/lib/chat/constants";

// 한글 글자(완성형·자음·모음)가 하나라도 있는지 확인하는 규칙
const HANGUL_PATTERN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

export const chatRequestSchema = z.object({
  question: z
    .string({ error: "질문을 입력해 주세요." })
    .trim()
    .min(1, "질문을 입력해 주세요.")
    .max(
      MAX_QUESTION_LENGTH,
      `질문은 ${MAX_QUESTION_LENGTH}자 이내로 입력해 주세요.`,
    )
    .refine((value) => HANGUL_PATTERN.test(value), {
      message: "한국어로 질문해 주세요.",
    }),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
