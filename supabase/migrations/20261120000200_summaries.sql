-- 작업 11: 월별 변동사항 요약 표
-- Design Ref: §5 summaries — 구분, 제목, 국문 요약(300자 이내), 원문 링크, 기준일, 상태(확인 대기/게시/반려).
-- 월별 화면에는 상태가 '게시'인 줄만 보인다. 자동 수집(작업 12)과 관리자 게시(작업 13)가 이 표를 채우고 바꾼다.
-- 이 표는 서버(service_role 키)만 읽고 쓴다. 브라우저에서 직접 접근하는 길은 열어 두지 않는다.

create table if not exists public.summaries (
  id            uuid        primary key default gen_random_uuid(),
  category      text        not null check (category in ('un_rules', 'unep_pipeline', 'unfccc_initial_report', 'unfccc_methodology')),
  title         text        not null,
  summary_ko    text        not null check (char_length(summary_ko) <= 300), -- 국문 요약(300자 이내)
  source_url    text        not null,                                         -- 원문 링크
  as_of         date        not null,                                         -- 기준일
  status        text        not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  is_sample     boolean     not null default false,                           -- true이면 화면 확인용 샘플(실제 요약 아님)
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);

create index if not exists summaries_status_as_of_idx on public.summaries (status, as_of desc);

-- 행 단위 보안을 켜고 정책을 만들지 않으면, service_role 외에는 접근할 수 없다.
alter table public.summaries enable row level security;
