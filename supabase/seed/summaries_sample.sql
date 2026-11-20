-- 작업 11: 월별 변동사항 화면 확인용 샘플 데이터 (is_sample = true)
-- 실제 UN·UNEP 내용이 아니라 화면 모양을 보기 위한 가짜 문장이다. 화면에는 "샘플" 표시가 붙는다.
-- 작업 12·13에서 실제 요약이 게시되면 샘플은 아래 문장으로 지운다:
--   delete from public.summaries where is_sample = true;
-- 원문 링크는 각 기관의 대표 주소만 넣었다(특정 문서 링크 아님).

insert into public.summaries (category, title, summary_ko, source_url, as_of, status, is_sample, published_at) values
  ('un_rules', '(샘플) 파리협정 제6.4조 감독기구 결정 요약',
   '샘플입니다. 이 칸에는 감독기구가 새로 채택한 표준·지침의 핵심 변동이 300자 이내의 쉬운 국문으로 들어갑니다. 무엇이 바뀌었는지, 누구에게 영향이 있는지를 짧게 적습니다.',
   'https://unfccc.int/process-and-meetings/the-paris-agreement/article6', date '2026-11-01', 'published', true, now()),
  ('un_rules', '(샘플) 파리협정 제6.2조 협력적 접근 관련 결정 요약',
   '샘플입니다. 협력적 접근(cooperative approaches)에 관한 결정문의 중요한 변동을 요약하는 칸입니다. 규정이 새로 생기거나 개정·폐지된 경우, 제출 기한·절차가 바뀐 경우만 다룹니다.',
   'https://unfccc.int', date '2026-10-15', 'published', true, now()),
  ('unep_pipeline', '(샘플) UNEP Pipeline 한국 관련 사업 현황',
   '샘플입니다. 한국이 관련된 사업 중 지난달과 달라진 것만 요약하는 칸입니다. 사업 수나 단계가 바뀐 경우를 숫자와 함께 적되, 원문에 없는 숫자는 쓰지 않습니다.',
   'https://unepccc.org', date '2026-11-01', 'published', true, now()),
  ('unfccc_initial_report', '(샘플) UNFCCC 초기보고서 제출 현황',
   '샘플입니다. 초기보고서(Initial Report)를 새로 제출하거나 검토 단계가 바뀐 국가를 요약하는 칸입니다.',
   'https://unfccc.int', date '2026-11-01', 'published', true, now()),
  ('unfccc_methodology', '(샘플) UNFCCC 방법론 현황',
   '샘플입니다. 방법론(Methodology)이 새로 승인되거나 개정된 현황을 요약하는 칸입니다.',
   'https://unfccc.int', date '2026-11-01', 'published', true, now());
