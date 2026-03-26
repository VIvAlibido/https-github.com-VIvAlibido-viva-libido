import { NextResponse } from 'next/server';
import { loadDailyOutput, saveDailyOutput, getTodayDate } from '@/lib/storage';
import { generateSocialPosts, generateRadioBulletins } from '@/lib/ai-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date || getTodayDate();

    const output = await loadDailyOutput(date);
    if (!output || output.articles.length === 0) {
      return NextResponse.json(
        { error: `No scraped articles found for ${date}. Run /api/cron first.` },
        { status: 404 }
      );
    }

    const [socialPosts, radioBulletins] = await Promise.all([
      generateSocialPosts(output.articles),
      generateRadioBulletins(output.articles),
    ]);

    output.socialPosts = socialPosts;
    output.radioBulletins = radioBulletins;
    output.pipelineStatus = 'complete';
    output.completedAt = new Date().toISOString();
    await saveDailyOutput(output);

    return NextResponse.json({
      status: 'complete',
      socialPosts: socialPosts.length,
      radioBulletins: radioBulletins.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
