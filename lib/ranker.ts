import { ScrapedArticle, RankedArticle } from './types';
import { RELEVANCE_KEYWORDS, MAX_ARTICLES } from './config';

// Higher score = more relevant/important
function scoreArticle(article: ScrapedArticle): number {
  let score = 0;

  // Recency: articles from last 24h score highest
  const ageHours = (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60);
  if (ageHours < 6) score += 50;
  else if (ageHours < 12) score += 40;
  else if (ageHours < 24) score += 30;
  else if (ageHours < 48) score += 15;
  else score += 5;

  // Source authority: local Ibiza papers rank higher
  const localSources = ['diario de ibiza', 'periódico de ibiza', 'última hora', 'ibiza spotlight'];
  if (localSources.some(s => article.source.toLowerCase().includes(s))) {
    score += 20;
  }

  // Keyword density in title
  const titleLower = article.title.toLowerCase();
  const keywordHits = RELEVANCE_KEYWORDS.filter(kw => titleLower.includes(kw));
  score += keywordHits.length * 5;

  // Longer descriptions tend to be more substantive
  if (article.description.length > 200) score += 10;
  else if (article.description.length > 100) score += 5;

  return score;
}

export function rankArticles(articles: ScrapedArticle[]): RankedArticle[] {
  const scored = articles.map(article => ({
    ...article,
    score: scoreArticle(article),
    rank: 0,
  }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, MAX_ARTICLES);
  return top.map((article, index) => ({
    ...article,
    rank: index + 1,
  }));
}
