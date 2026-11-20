-- 작업 12: 자동 수집이 같은 요약을 두 번 저장하지 않도록 (구분, 원문 링크, 기준일)이 같은 줄을 막는다.
-- 샘플 줄(is_sample)에는 영향이 없다(링크·기준일이 다르다).
create unique index if not exists summaries_category_source_as_of_key
  on public.summaries (category, source_url, as_of);
