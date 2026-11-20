// Design Ref: §3.2 — 챗봇 화면(`/`). 질문 입력창과 답변 카드는 ChatPanel이 맡는다.
// 지금은 임시 답변이며, 검색·AI 답변·출처는 PLAN 작업 5·6에서 만든다.
import ChatPanel from "@/components/chat/ChatPanel";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">챗봇</h1>
        <p className="mt-1 text-sm text-foreground/70">
          국제감축 규정(UN 제도, 국내 법령·지침)을 쉬운 국문으로 알려 드립니다.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
