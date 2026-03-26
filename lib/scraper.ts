import Parser from 'rss-parser';
import crypto from 'crypto';
import { ScrapedArticle, FeedSource } from './types';
import { FEED_SOURCES, RELEVANCE_KEYWORDS } from './config';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'IbizaNewsAggregator/1.0',
  },
});

function generateId(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
}

// Core keywords that MUST appear in the title or description
const STRICT_KEYWORDS = [
  'ibiza', 'eivissa', 'formentera', 'pitiusas', 'pitiüses',
  'sant antoni', 'san antonio ibiza', 'santa eulalia', 'santa eulària',
  'sant josep', 'san josé ibiza', 'sant joan', 'dalt vila',
  'playa d\'en bossa', 'es canar', 'cala conta', 'es pujols',
  'la savina', 'sant francesc', 'ses salines ibiza',
];

function isRelevant(title: string, description: string, source: FeedSource): boolean {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();

  // Title MUST contain at least one Ibiza/Formentera keyword
  // This filters out international news that only mentions Ibiza in passing
  const titleHasKeyword = STRICT_KEYWORDS.some(kw => titleLower.includes(kw));
  const descHasKeyword = STRICT_KEYWORDS.some(kw => descLower.includes(kw));

  // For direct Ibiza newspaper feeds (Diario de Ibiza etc), description match is enough
  if (source.name.includes('Diario de Ibiza') || source.name.includes('Periódico de Ibiza')) {
    return titleHasKeyword || descHasKeyword;
  }

  // For Google News and other aggregators, require keyword in title
  // This is strict but prevents irrelevant international articles
  return titleHasKeyword;
}

async function scrapeFeed(source: FeedSource): Promise<ScrapedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    const now = new Date().toISOString();

    const articles: ScrapedArticle[] = [];
    for (const item of feed.items || []) {
      const title = item.title || '';
      const description = item.contentSnippet || item.content || item.summary || '';
      const link = item.link || '';

      if (!title || !link) continue;
      if (!isRelevant(title, description, source)) continue;

      articles.push({
        id: generateId(link),
        title: title.trim(),
        description: description.trim().slice(0, 500),
        link,
        pubDate: item.pubDate || item.isoDate || now,
        source: source.name,
        sourceLanguage: source.language,
        scrapedAt: now,
      });
    }

    console.log(`[Scraper] ${source.name}: found ${articles.length} relevant articles`);
    return articles;
  } catch (error) {
    console.error(`[Scraper] Failed to scrape ${source.name}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

export async function scrapeAllFeeds(): Promise<ScrapedArticle[]> {
  const enabledSources = FEED_SOURCES.filter(s => s.enabled);
  console.log(`[Scraper] Scraping ${enabledSources.length} feeds...`);

  const results = await Promise.allSettled(
    enabledSources.map(source => scrapeFeed(source))
  );

  const allArticles: ScrapedArticle[] = [];
  const seenIds = new Set<string>();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const article of result.value) {
        if (!seenIds.has(article.id)) {
          seenIds.add(article.id);
          allArticles.push(article);
        }
      }
    }
  }

  console.log(`[Scraper] Total unique articles: ${allArticles.length}`);
  return allArticles;
}
