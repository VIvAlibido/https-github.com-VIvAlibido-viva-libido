import { NextResponse } from 'next/server';
import { scrapeAllFeeds } from '@/lib/scraper';
import { rankArticles } from '@/lib/ranker';
import { generateRadioBulletins } from '@/lib/ai-generator';
import { loadDailyOutput, saveDailyOutput, getTodayDate } from '@/lib/storage';
import { DailyOutput, RadioTimeSlot } from '@/lib/types';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && cronSecret !== 'your-cron-secret-here' && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runRadioUpdate();
}

export async function POST() {
  return runRadioUpdate();
}

async function runRadioUpdate() {
  const date = getTodayDate();
  const now = new Date();
  const timeSlot = `${now.getHours().toString().padStart(2, '0')}:00`;

  try {
    console.log(`[Radio Update] Starting for ${date} ${timeSlot}`);

    // Scrape fresh news
    const scraped = await scrapeAllFeeds();
    if (scraped.length === 0) {
      return NextResponse.json({ status: 'error', error: 'Geen artikelen gevonden' });
    }

    const ranked = rankArticles(scraped);

    // Generate fresh radio bulletins
    const bulletins = await generateRadioBulletins(ranked);
    const taggedBulletins = bulletins.map(b => ({ ...b, timeSlot }));

    const newTimeSlot: RadioTimeSlot = {
      timeSlot,
      generatedAt: now.toISOString(),
      bulletins: taggedBulletins,
    };

    // Load existing daily output or create new one
    let output = await loadDailyOutput(date);
    if (!output) {
      output = {
        date,
        articles: ranked,
        socialPosts: [],
        radioBulletins: taggedBulletins,
        radioTimeSlots: [newTimeSlot],
        pipelineStatus: 'complete',
        completedAt: now.toISOString(),
      };
    } else {
      // Update with latest bulletins and add to time slots
      output.radioBulletins = taggedBulletins;
      output.articles = ranked;
      if (!output.radioTimeSlots) output.radioTimeSlots = [];
      // Replace if same time slot exists, otherwise add
      const existingIdx = output.radioTimeSlots.findIndex(s => s.timeSlot === timeSlot);
      if (existingIdx >= 0) {
        output.radioTimeSlots[existingIdx] = newTimeSlot;
      } else {
        output.radioTimeSlots.push(newTimeSlot);
      }
    }

    await saveDailyOutput(output);

    console.log(`[Radio Update] Complete! ${taggedBulletins.length} bulletins for ${timeSlot}`);

    return NextResponse.json({
      status: 'complete',
      timeSlot,
      bulletins: taggedBulletins.length,
      totalTimeSlots: output.radioTimeSlots.length,
    });
  } catch (error) {
    console.error('[Radio Update] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Onbekende fout' },
      { status: 500 }
    );
  }
}
