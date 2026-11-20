-- 작업 10: 질문 익명 저장(서비스 개선용)과 90일 후 삭제
-- Design Ref: §5 questions — 가려진 질문 글, 저장 시각, 삭제 예정일. 누가 물었는지 알 수 있는 정보는 저장하지 않는다.
-- (브라우저 구분 값·IP 주소·답변 내용은 이 표에 넣지 않는다.)
-- 이 표는 서버(service_role 키)만 읽고 쓴다. 관리자 열람 화면은 작업 13에서 만든다.

create table if not exists public.questions (
  id          uuid        primary key default gen_random_uuid(),
  question    text        not null check (char_length(question) <= 400), -- 이메일·전화번호를 가린 질문
  outcome     text        not null check (outcome in ('answered', 'no_evidence', 'legal_judgment', 'project_status')),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '90 days')  -- 이 시각이 지나면 삭제
);

-- 삭제 대상을 빨리 찾기 위한 색인
create index if not exists questions_expires_at_idx on public.questions (expires_at);

-- 행 단위 보안을 켜고 정책을 만들지 않으면, service_role 외에는 접근할 수 없다.
alter table public.questions enable row level security;

-- 질문 1건을 저장한다.
create or replace function public.save_question(
  p_question text, p_outcome text
) returns void
language sql security definer set search_path = public as $$
  insert into public.questions (question, outcome) values (p_question, p_outcome);
$$;

-- 삭제 예정일이 지난 질문을 지운다. 지운 건수를 돌려준다(자동 실행 연결은 작업 16).
create or replace function public.cleanup_expired_questions() returns integer
language plpgsql security definer set search_path = public as $$
declare
  removed integer;
begin
  delete from public.questions where expires_at < now();
  get diagnostics removed = row_count;
  return removed;
end $$;

revoke all on function public.save_question(text, text) from public, anon, authenticated;
revoke all on function public.cleanup_expired_questions() from public, anon, authenticated;
grant execute on function public.save_question(text, text) to service_role;
grant execute on function public.cleanup_expired_questions() to service_role;
