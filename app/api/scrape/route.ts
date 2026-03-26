import { NextResponse } from 'next/server';
import { scrapeAllFeeds } from '@/lib/scraper';
import { rankArticles } from '@/lib/ranker';

export async function POST() {
  try {
    const articles = await scrapeAllFeeds();
    const ranked = rankArticles(articles);

    return NextResponse.json({
      total: articles.length,
      top10: ranked.length,
      articles: ranked,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scrape failed' },
      { status: 500 }
    );
  }
}
