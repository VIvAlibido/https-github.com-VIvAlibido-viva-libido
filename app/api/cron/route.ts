import { NextResponse } from 'next/server';
import { scrapeAllFeeds } from '@/lib/scraper';
import { rankArticles } from '@/lib/ranker';
import { sourceImages } from '@/lib/image-sourcer';
import { generateSocialPosts, generateRadioBulletins } from '@/lib/ai-generator';
import { saveDailyOutput, getTodayDate } from '@/lib/storage';
import { DailyOutput } from '@/lib/types';

export const maxDuration = 300; // 5 min timeout for serverless

export async function GET(request: Request) {
  // Optional: verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && cronSecret !== 'your-cron-secret-here' && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return runPipeline();
}

export async function POST() {
  return runPipeline();
}

async function runPipeline() {
  const date = getTodayDate();
  const now = new Date();
  const timeSlot = `${now.getHours().toString().padStart(2, '0')}:00`;
  const output: DailyOutput = {
    date,
    articles: [],
    socialPosts: [],
    radioBulletins: [],
    radioTimeSlots: [],
    pipelineStatus: 'pending',
  };

  try {
    // Step 1: Scrape
    console.log(`[Pipeline] Starting for ${date}`);
    output.pipelineStatus = 'scraping';
    await saveDailyOutput(output);

    const scraped = await scrapeAllFeeds();
    if (scraped.length === 0) {
      output.pipelineStatus = 'error';
      output.error = 'No articles found from any feed';
      await saveDailyOutput(output);
      return NextResponse.json({ status: 'error', error: output.error });
    }

    // Step 2: Rank
    output.pipelineStatus = 'ranking';
    await saveDailyOutput(output);

    const ranked = rankArticles(scraped);

    // Step 3: Source images
    const withImages = await sourceImages(ranked);
    output.articles = withImages;
    await saveDailyOutput(output);

    // Step 4: Generate AI content
    output.pipelineStatus = 'generating';
    await saveDailyOutput(output);

    const [socialPosts, radioBulletins] = await Promise.all([
      generateSocialPosts(withImages),
      generateRadioBulletins(withImages),
    ]);

    const taggedBulletins = radioBulletins.map(b => ({ ...b, timeSlot }));
    output.socialPosts = socialPosts;
    output.radioBulletins = taggedBulletins;
    output.radioTimeSlots = [{
      timeSlot,
      generatedAt: now.toISOString(),
      bulletins: taggedBulletins,
    }];
    output.pipelineStatus = 'complete';
    output.completedAt = new Date().toISOString();
    await saveDailyOutput(output);

    console.log(`[Pipeline] Complete! ${output.articles.length} articles, ${output.socialPosts.length} posts, ${output.radioBulletins.length} bulletins`);

    return NextResponse.json({
      status: 'complete',
      date,
      articles: output.articles.length,
      socialPosts: output.socialPosts.length,
      radioBulletins: output.radioBulletins.length,
    });
  } catch (error) {
    output.pipelineStatus = 'error';
    output.error = error instanceof Error ? error.message : 'Unknown error';
    await saveDailyOutput(output);
    console.error('[Pipeline] Error:', output.error);
    return NextResponse.json({ status: 'error', error: output.error }, { status: 500 });
  }
}
