// Design Ref: §3.4, §5 news — 오늘의 뉴스: 최신순 10건을 저장소에서 읽는다. 서버 코드에서만 불러온다.
import { selectRows } from "@/lib/db";

export type NewsItem = {
  id: string;
  title: string;
  originalTitle: string | null;
  outlet: string;
  publishedOn: string;
  sourceUrl: string;
  summaryKo: string | null;
};

type Row = {
  id: string;
  title: string;
  original_title: string | null;
  outlet: string;
  published_on: string;
  source_url: string;
  summary_ko: string | null;
};

export async function listLatestNews(limit = 10): Promise<NewsItem[]> {
  const rows = await selectRows<Row>("news", {
    select: "id,title,original_title,outlet,published_on,source_url,summary_ko",
    order: "published_on.desc,collected_at.desc",
    limit: String(limit),
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    originalTitle: r.original_title,
    outlet: r.outlet,
    publishedOn: r.published_on,
    sourceUrl: r.source_url,
    summaryKo: r.summary_ko,
  }));
}
