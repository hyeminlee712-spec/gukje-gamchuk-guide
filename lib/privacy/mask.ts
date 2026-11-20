// Design Ref: §4.1 ④·⑧ — 질문 속 개인정보(이메일·전화번호)를 AI에 보내기 전과 저장 전에 가린다.
// Plan SC: PRD 7번 — 이메일·전화번호처럼 보이는 내용이 질문에 있으면 외부 AI 서비스로 보내기 전에, 그리고 저장 전에 가린다.
// 주민등록번호 모양도 함께 가린다(PRD에 적힌 것은 아니지만 같은 성격의 정보라 안전하게 처리한다).
// 가져오는 것이 없는 순수 함수라 서버·화면 어디에서든 쓸 수 있다.

// 숫자 덩어리의 한가운데를 잘라 잘못 가리지 않도록 앞뒤에 숫자가 없을 때만 전화번호로 본다.
const BOUNDARY_START = "(?<![0-9])";
const BOUNDARY_END = "(?![0-9])";
const SEP = "[-.\\s]?";

// 이메일: 이름@도메인.최상위
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// 주민등록번호: 앞 6자리 + 뒤 7자리(첫 자리 1~4)
const RESIDENT_ID = new RegExp(
  `${BOUNDARY_START}[0-9]{6}[-\\s]?[1-4][0-9]{6}${BOUNDARY_END}`,
  "g",
);

// 전화번호: 휴대전화(010 등), 서울(02), 지역(031 등), 인터넷전화(070), 국가번호(+82) 형태
const PHONE = new RegExp(
  [
    `${BOUNDARY_START}\\+82${SEP}(?:10|2|[3-6][1-5]|70)${SEP}[0-9]{3,4}${SEP}[0-9]{4}${BOUNDARY_END}`,
    `${BOUNDARY_START}01[016789]${SEP}[0-9]{3,4}${SEP}[0-9]{4}${BOUNDARY_END}`,
    `${BOUNDARY_START}02${SEP}[0-9]{3,4}${SEP}[0-9]{4}${BOUNDARY_END}`,
    `${BOUNDARY_START}0[3-6][1-5]${SEP}[0-9]{3,4}${SEP}[0-9]{4}${BOUNDARY_END}`,
    `${BOUNDARY_START}070${SEP}[0-9]{3,4}${SEP}[0-9]{4}${BOUNDARY_END}`,
  ].join("|"),
  "g",
);

// 질문 속 개인정보를 "[이메일]", "[전화번호]", "[주민등록번호]"로 바꾼다.
// 순서: 주민등록번호를 먼저 가려야 13자리 숫자가 전화번호 모양과 겹치지 않는다.
export function maskPersonalInfo(text: string): string {
  return text
    .replace(EMAIL, "[이메일]")
    .replace(RESIDENT_ID, "[주민등록번호]")
    .replace(PHONE, "[전화번호]");
}
