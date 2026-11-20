// Design Ref: §3.2 — "확인되지 않음" 때 안내하는 문의처(부처·공식 사이트) 목록. 고정 문구로 보여 준다.
// ※ 처음 정한 목록이다. 안내할 곳을 바꾸려면 이 파일만 고치면 된다. 비밀 값이 없어 화면에서도 쓸 수 있다.
export type ContactLink = { label: string; href: string };

export const CONTACT_LINKS: ContactLink[] = [
  { label: "UNFCCC", href: "https://unfccc.int" },
  { label: "국가법령정보센터", href: "https://www.law.go.kr" },
  { label: "기후에너지환경부", href: "https://www.mcee.go.kr" },
  { label: "산업통상부", href: "https://www.motir.go.kr" },
  { label: "외교부", href: "https://www.mofa.go.kr" },
  { label: "재정경제부", href: "https://www.mofe.go.kr" },
  { label: "해양수산부", href: "https://www.mof.go.kr" },
  { label: "산림청", href: "https://www.forest.go.kr" },
  { label: "농림축산식품부", href: "https://www.mafra.go.kr" },
];
