-- 작업 16: 정해진 기간이 지난 뉴스·반려 요약을 지우는 정리 함수
-- Design Ref: §5 — 뉴스 90일 뒤 삭제, 반려한 요약 30일 뒤 삭제(수집 시각 기준). 서버(service_role)만 부를 수 있다.

create or replace function public.cleanup_expired_news() returns integer
language plpgsql security definer set search_path = public as $$
declare
  removed integer;
begin
  delete from public.news where expires_at < now();
  get diagnostics removed = row_count;
  return removed;
end $$;

create or replace function public.cleanup_rejected_summaries() returns integer
language plpgsql security definer set search_path = public as $$
declare
  removed integer;
begin
  delete from public.summaries where status = 'rejected' and created_at < now() - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end $$;

revoke all on function public.cleanup_expired_news() from public, anon, authenticated;
revoke all on function public.cleanup_rejected_summaries() from public, anon, authenticated;
grant execute on function public.cleanup_expired_news() to service_role;
grant execute on function public.cleanup_rejected_summaries() to service_role;
