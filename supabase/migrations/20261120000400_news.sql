-- 작업 14: 오늘의 뉴스 표
-- Design Ref: §5 news — 제목, 언론사, 날짜, 원문 링크, 요약, 수집 시각. 같은 링크는 한 번만 저장하고 90일 뒤 삭제한다.
-- 기사 전문은 저장하지 않는다(저작권). 서버(service_role 키)만 읽고 쓴다.

create table if not exists public.news (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,                                  -- 화면에 보이는 제목(영문 기사는 국문으로 옮김)
  original_title  text,                                                  -- 영문 기사의 원래 제목(없으면 null)
  outlet          text        not null,                                  -- 언론사명
  published_on    date        not null,                                  -- 기사 날짜
  source_url      text        not null,                                  -- 원문 링크(같은 링크는 한 번만)
  summary_ko      text        check (summary_ko is null or char_length(summary_ko) <= 100), -- 100자 이내 요약(없을 수 있음)
  collected_at    timestamptz not null default now(),
  expires_at      timestamptz not null default now() + interval '90 days'
);

create unique index if not exists news_source_url_key on public.news (source_url);
create index if not exists news_published_idx on public.news (published_on desc, collected_at desc);

alter table public.news enable row level security;
