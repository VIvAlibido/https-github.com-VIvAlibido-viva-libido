export type Language = 'en' | 'es' | 'nl';
export type Platform = 'instagram' | 'facebook' | 'app';

export interface ScrapedArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLanguage: Language;
  scrapedAt: string;
}

export interface RankedArticle extends ScrapedArticle {
  score: number;
  rank: number;
  imageUrl?: string;
  imageCredit?: string;
}

export interface SocialPost {
  articleId: string;
  platform: Platform;
  language: Language;
  title: string;
  text: string;
  hashtags: string[];
  generatedAt: string;
}

export interface RadioBulletin {
  bulletinNumber: number;
  language: Language;
  text: string;
  intro?: string;
  outro?: string;
  articleIds: string[];
  wordCount: number;
  estimatedSeconds: number;
  generatedAt: string;
}

export interface DailyOutput {
  date: string;
  articles: RankedArticle[];
  socialPosts: SocialPost[];
  radioBulletins: RadioBulletin[];
  pipelineStatus: 'pending' | 'scraping' | 'ranking' | 'generating' | 'complete' | 'error';
  error?: string;
  completedAt?: string;
}

export interface FeedSource {
  name: string;
  url: string;
  language: Language;
  keywords?: string[];
  enabled: boolean;
}
