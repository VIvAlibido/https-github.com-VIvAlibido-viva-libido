import Anthropic from '@anthropic-ai/sdk';
import { RankedArticle, SocialPost, RadioBulletin, Language, Platform } from './types';
import { SOCIAL_LIMITS, WORDS_PER_BULLETIN, RADIO_BULLETIN_COUNT } from './config';

const client = new Anthropic();

interface SocialPostResult {
  instagram: { en: string; es: string; nl: string; hashtags: string[] };
  facebook: { en: string; es: string; nl: string; hashtags: string[] };
  app: { en: string; es: string; nl: string; hashtags: string[] };
}

export async function generateSocialPosts(articles: RankedArticle[]): Promise<SocialPost[]> {
  const allPosts: SocialPost[] = [];

  for (const article of articles) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are a professional social media content writer for a news outlet covering Ibiza and Formentera.
You write engaging, informative posts in three languages: English, Spanish, and Dutch.
Always respond with valid JSON only, no markdown or explanation.`,
        messages: [{
          role: 'user',
          content: `Rewrite this news article as social media posts for 3 platforms in 3 languages.

Article title: ${article.title}
Article description: ${article.description}
Source: ${article.source}

Create posts for:
- Instagram (max ${SOCIAL_LIMITS.instagram} chars, visual/engaging tone, include relevant emojis)
- Facebook (max ${SOCIAL_LIMITS.facebook} chars, conversational tone)
- App notification (max ${SOCIAL_LIMITS.app} chars, concise/informative)

Each in English (en), Spanish (es), and Dutch (nl).
Dutch should sound natural, as spoken in the Netherlands.

Respond ONLY with this JSON structure:
{
  "instagram": { "en": "...", "es": "...", "nl": "...", "hashtags": ["Ibiza", "Formentera", ...] },
  "facebook": { "en": "...", "es": "...", "nl": "...", "hashtags": ["Ibiza", ...] },
  "app": { "en": "...", "es": "...", "nl": "...", "hashtags": [] }
}`
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result: SocialPostResult = JSON.parse(cleaned);

      const platforms: Platform[] = ['instagram', 'facebook', 'app'];
      const languages: Language[] = ['en', 'es', 'nl'];
      const now = new Date().toISOString();

      for (const platform of platforms) {
        for (const lang of languages) {
          allPosts.push({
            articleId: article.id,
            platform,
            language: lang,
            title: article.title,
            text: result[platform][lang],
            hashtags: result[platform].hashtags || [],
            generatedAt: now,
          });
        }
      }

      console.log(`[AI] Generated social posts for: ${article.title.slice(0, 50)}...`);
    } catch (error) {
      console.error(`[AI] Failed to generate posts for article ${article.id}:`, error instanceof Error ? error.message : error);
    }
  }

  return allPosts;
}

export async function generateRadioBulletins(articles: RankedArticle[]): Promise<RadioBulletin[]> {
  // Import weather data
  const { fetchIbizaWeather, formatWeatherBulletin } = await import('./weather');
  const weather = await fetchIbizaWeather();

  const articleSummaries = articles
    .slice(0, 6)
    .map((a, i) => `${i + 1}. [${a.source}] ${a.title}\n   ${a.description.slice(0, 200)}`)
    .join('\n\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You are a professional radio news writer for a local Ibiza radio station.
You ONLY write about things happening ON Ibiza and Formentera. Never include international news, national Spanish news, or news from other countries.
Every story must be directly about life, events, politics, or happenings ON the islands of Ibiza or Formentera.
You write clear, broadcast-ready bulletins that sound natural when read aloud.
Each bulletin item should be approximately ${WORDS_PER_BULLETIN} words (about 25 seconds at broadcast pace).
Always respond with valid JSON only.`,
      messages: [{
        role: 'user',
        content: `Create a 2-minute radio news bulletin for Ibiza radio with EXACTLY this structure:

1. NIEUWS 1: The most important LOCAL news happening ON Ibiza or Formentera (~${WORDS_PER_BULLETIN} words)
2. NIEUWS 2: Second most important LOCAL news happening ON Ibiza or Formentera (~${WORDS_PER_BULLETIN} words)
3. EVENTS & CULTUUR: A local event, festival, market, exhibition, cultural activity, or entertainment happening ON Ibiza or Formentera (~${WORDS_PER_BULLETIN} words)
4. (Weather will be added separately, do NOT include weather)

IMPORTANT: ALL stories must be about things happening ON Ibiza or Formentera. No international news, no national Spanish news, no news from other countries. Only local island news.

Available stories:
${articleSummaries}

Pick the 2 best LOCAL news stories for items 1 and 2. They must be about something happening on the island.
For item 3, pick the most interesting local event, cultural, or entertainment story. If none of the articles is about events/culture, write about something typical happening on the island right now (markets, nightlife, beach season, local traditions, etc.).

Include a warm, friendly intro and outro suitable for island radio.

Create all content in 3 languages: English (en), Spanish (es), and Dutch (nl).
Dutch should sound natural, as spoken in the Netherlands.
Spanish should be Castilian Spanish.

Respond ONLY with this JSON:
{
  "intro": { "en": "...", "es": "...", "nl": "..." },
  "outro": { "en": "...", "es": "...", "nl": "..." },
  "bulletins": [
    { "number": 1, "type": "news", "en": "...", "es": "...", "nl": "...", "articleIndex": 0 },
    { "number": 2, "type": "news", "en": "...", "es": "...", "nl": "...", "articleIndex": 1 },
    { "number": 3, "type": "event", "en": "...", "es": "...", "nl": "...", "articleIndex": 2 }
  ]
}`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);
    const now = new Date().toISOString();
    const languages: Language[] = ['en', 'es', 'nl'];
    const bulletins: RadioBulletin[] = [];

    for (const lang of languages) {
      // Items 1-3 from AI
      for (const item of result.bulletins) {
        const bulletinText = item[lang];
        const wordCount = bulletinText.split(/\s+/).length;

        bulletins.push({
          bulletinNumber: item.number,
          language: lang,
          text: bulletinText,
          intro: result.intro[lang],
          outro: result.outro[lang],
          articleIds: [articles[item.articleIndex]?.id].filter(Boolean),
          wordCount,
          estimatedSeconds: Math.round(wordCount / 2.6),
          generatedAt: now,
        });
      }

      // Item 4: Weather bulletin
      const weatherText = weather
        ? formatWeatherBulletin(weather, lang)
        : lang === 'nl' ? 'Weerbericht momenteel niet beschikbaar.'
        : lang === 'es' ? 'Pronóstico del tiempo no disponible en este momento.'
        : 'Weather forecast currently unavailable.';

      const weatherWords = weatherText.split(/\s+/).length;
      bulletins.push({
        bulletinNumber: 4,
        language: lang,
        text: weatherText,
        intro: result.intro[lang],
        outro: result.outro[lang],
        articleIds: [],
        wordCount: weatherWords,
        estimatedSeconds: Math.round(weatherWords / 2.6),
        generatedAt: now,
      });
    }

    console.log(`[AI] Generated ${bulletins.length} radio bulletins (incl. weather)`);
    return bulletins;
  } catch (error) {
    console.error('[AI] Failed to generate radio bulletins:', error instanceof Error ? error.message : error);
    return [];
  }
}
