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
  const articleSummaries = articles
    .slice(0, RADIO_BULLETIN_COUNT)
    .map((a, i) => `${i + 1}. [${a.source}] ${a.title}\n   ${a.description.slice(0, 200)}`)
    .join('\n\n');

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You are a professional radio news writer for an Ibiza-based radio station.
You write clear, broadcast-ready news bulletins that sound natural when read aloud.
Each bulletin item should be approximately ${WORDS_PER_BULLETIN} words (about 25 seconds at broadcast pace).
Always respond with valid JSON only.`,
      messages: [{
        role: 'user',
        content: `Create a 2-minute radio news bulletin from these top ${RADIO_BULLETIN_COUNT} Ibiza & Formentera stories.

Stories:
${articleSummaries}

Write ${RADIO_BULLETIN_COUNT} bulletin items, each ~${WORDS_PER_BULLETIN} words.
Include an intro and outro for the full bulletin.

Create all content in 3 languages: English (en), Spanish (es), and Dutch (nl).
Dutch should sound natural, as spoken in the Netherlands.
Spanish should be Castilian Spanish.

Respond ONLY with this JSON:
{
  "intro": { "en": "Good morning, here's your Ibiza news update...", "es": "...", "nl": "..." },
  "outro": { "en": "That's your Ibiza news update for today...", "es": "...", "nl": "..." },
  "bulletins": [
    {
      "number": 1,
      "en": "bulletin text...",
      "es": "bulletin text...",
      "nl": "bulletin text...",
      "articleIndex": 0
    }
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
          estimatedSeconds: Math.round(wordCount / 2.6), // ~2.6 words/sec broadcast pace
          generatedAt: now,
        });
      }
    }

    console.log(`[AI] Generated ${bulletins.length} radio bulletins`);
    return bulletins;
  } catch (error) {
    console.error('[AI] Failed to generate radio bulletins:', error instanceof Error ? error.message : error);
    return [];
  }
}
