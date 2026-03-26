import { RankedArticle } from './types';

const UNSPLASH_API = 'https://api.unsplash.com';

interface UnsplashPhoto {
  urls: { regular: string; small: string };
  user: { name: string; links: { html: string } };
  alt_description?: string;
}

function extractKeywords(title: string): string {
  const stopWords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but',
    'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have', 'had',
    'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'en', 'por', 'para',
    'het', 'de', 'een', 'van', 'en', 'op', 'voor', 'met', 'naar',
  ]);

  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 3)
    .join(' ');
}

async function searchUnsplash(query: string): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || accessKey === 'your-unsplash-access-key-here') {
    return null;
  }

  try {
    const url = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0] as UnsplashPhoto;
    }
    return null;
  } catch (error) {
    console.error(`[Images] Unsplash search failed for "${query}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function sourceImages(articles: RankedArticle[]): Promise<RankedArticle[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey || accessKey === 'your-unsplash-access-key-here') {
    console.log('[Images] No Unsplash API key configured, using fallback images');
    return articles.map(article => ({
      ...article,
      imageUrl: `https://images.unsplash.com/photo-1573397522793-4608fca1f384?w=800&q=80`, // generic Ibiza fallback
      imageCredit: 'Unsplash',
    }));
  }

  const results: RankedArticle[] = [];

  for (const article of articles) {
    const keywords = extractKeywords(article.title);
    const query = `Ibiza ${keywords}`;

    const photo = await searchUnsplash(query);

    if (photo) {
      results.push({
        ...article,
        imageUrl: photo.urls.regular,
        imageCredit: `Photo by ${photo.user.name} on Unsplash`,
      });
      console.log(`[Images] Found image for: ${article.title.slice(0, 40)}...`);
    } else {
      // Fallback: try just "Ibiza" or "Formentera"
      const fallbackQuery = article.title.toLowerCase().includes('formentera') ? 'Formentera beach' : 'Ibiza';
      const fallbackPhoto = await searchUnsplash(fallbackQuery);

      results.push({
        ...article,
        imageUrl: fallbackPhoto?.urls.regular || 'https://images.unsplash.com/photo-1573397522793-4608fca1f384?w=800&q=80',
        imageCredit: fallbackPhoto ? `Photo by ${fallbackPhoto.user.name} on Unsplash` : 'Unsplash',
      });
    }
  }

  return results;
}
