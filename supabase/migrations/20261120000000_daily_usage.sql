-- 작업 9: 하루 질문 5개 제한용 표와 함수
-- Design Ref: §5 daily_usage — 브라우저 식별값(해시), 날짜(한국시간), 질문 횟수. 7일 후 삭제(작업 16에서 자동 삭제 연결).
-- 이 표는 서버(service_role 키)만 읽고 쓴다. 브라우저에서 직접 접근하는 길은 열어 두지 않는다.

create table if not exists public.daily_usage (
  browser_hash text        not null,           -- 브라우저에 저장한 무작위 값의 해시(IP는 쓰지 않음)
  usage_date   date        not null,           -- 한국시간 기준 날짜
  count        integer     not null default 0, -- 오늘 사용한 질문 수
  updated_at   timestamptz not null default now(),
  primary key (browser_hash, usage_date)
);

-- 행 단위 보안을 켜고 정책을 만들지 않으면, service_role 외에는 접근할 수 없다.
alter table public.daily_usage enable row level security;

-- 질문 1개를 쓴다. 한도 안이면 1 올리고 남은 횟수를 돌려주고, 한도를 넘으면 올리지 않는다.
create or replace function public.consume_daily_question(
  p_hash text, p_date date, p_limit integer
) returns table (allowed boolean, remaining integer)
language plpgsql security definer set search_path = public as $$
declare
  new_count integer;
begin
  insert into public.daily_usage (browser_hash, usage_date, count)
  values (p_hash, p_date, 0)
  on conflict (browser_hash, usage_date) do nothing;

  -- 한 문장으로 올리므로 동시에 여러 질문이 와도 한도를 넘지 않는다.
  update public.daily_usage
     set count = count + 1, updated_at = now()
   where browser_hash = p_hash and usage_date = p_date and count < p_limit
  returning count into new_count;

  if new_count is null then
    return query select false, 0;
  else
    return query select true, p_limit - new_count;
  end if;
end $$;

-- 질문 1개를 돌려준다(AI 오류처럼 사용자 잘못이 아닌 실패일 때).
create or replace function public.refund_daily_question(
  p_hash text, p_date date
) returns void
language sql security definer set search_path = public as $$
  update public.daily_usage
     set count = greatest(count - 1, 0), updated_at = now()
   where browser_hash = p_hash and usage_date = p_date;
$$;

-- 오늘 남은 횟수를 본다(표에 줄이 없으면 한도 전체가 남은 것이다).
create or replace function public.get_daily_remaining(
  p_hash text, p_date date, p_limit integer
) returns integer
language sql security definer set search_path = public as $$
  select greatest(p_limit - coalesce(
    (select count from public.daily_usage
      where browser_hash = p_hash and usage_date = p_date), 0), 0);
$$;

-- 7일이 지난 줄을 지운다(자동 실행 연결은 작업 16).
create or replace function public.cleanup_daily_usage() returns integer
language plpgsql security definer set search_path = public as $$
declare
  removed integer;
begin
  delete from public.daily_usage where usage_date < (now() at time zone 'Asia/Seoul')::date - 7;
  get diagnostics removed = row_count;
  return removed;
end $$;

-- 함수는 서버(service_role)만 부를 수 있게 한다.
revoke all on function public.consume_daily_question(text, date, integer) from public, anon, authenticated;
revoke all on function public.refund_daily_question(text, date) from public, anon, authenticated;
revoke all on function public.get_daily_remaining(text, date, integer) from public, anon, authenticated;
revoke all on function public.cleanup_daily_usage() from public, anon, authenticated;
grant execute on function public.consume_daily_question(text, date, integer) to service_role;
grant execute on function public.refund_daily_question(text, date) to service_role;
grant execute on function public.get_daily_remaining(text, date, integer) to service_role;
grant execute on function public.cleanup_daily_usage() to service_role;
