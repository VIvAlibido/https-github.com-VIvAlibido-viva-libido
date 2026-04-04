import cron from 'node-cron';
import { CRON_SCHEDULE, RADIO_CRON_SCHEDULE } from './config';

let isSchedulerRunning = false;

async function runFullPipeline() {
  console.log('[Scheduler] Volledige pipeline starten...');
  try {
    const { scrapeAllFeeds } = await import('./scraper');
    const { rankArticles } = await import('./ranker');
    const { sourceImages } = await import('./image-sourcer');
    const { generateSocialPosts, generateRadioBulletins } = await import('./ai-generator');
    const { saveDailyOutput, getTodayDate } = await import('./storage');

    const date = getTodayDate();
    const now = new Date();
    const timeSlot = `${now.getHours().toString().padStart(2, '0')}:00`;

    const scraped = await scrapeAllFeeds();
    if (scraped.length === 0) {
      console.log('[Scheduler] Geen artikelen gevonden');
      return;
    }

    const ranked = rankArticles(scraped);
    const withImages = await sourceImages(ranked);

    const [socialPosts, radioBulletins] = await Promise.all([
      generateSocialPosts(withImages),
      generateRadioBulletins(withImages),
    ]);

    const taggedBulletins = radioBulletins.map(b => ({ ...b, timeSlot }));

    await saveDailyOutput({
      date,
      articles: withImages,
      socialPosts,
      radioBulletins: taggedBulletins,
      radioTimeSlots: [{
        timeSlot,
        generatedAt: now.toISOString(),
        bulletins: taggedBulletins,
      }],
      pipelineStatus: 'complete',
      completedAt: now.toISOString(),
    });

    console.log(`[Scheduler] Pipeline klaar! ${withImages.length} artikelen, ${socialPosts.length} posts, ${taggedBulletins.length} bulletins`);
  } catch (error) {
    console.error('[Scheduler] Pipeline fout:', error instanceof Error ? error.message : error);
  }
}

async function runRadioUpdate() {
  console.log('[Scheduler] Radio bulletin update starten...');
  try {
    const { scrapeAllFeeds } = await import('./scraper');
    const { rankArticles } = await import('./ranker');
    const { generateRadioBulletins } = await import('./ai-generator');
    const { loadDailyOutput, saveDailyOutput, getTodayDate } = await import('./storage');

    const date = getTodayDate();
    const now = new Date();
    const timeSlot = `${now.getHours().toString().padStart(2, '0')}:00`;

    const scraped = await scrapeAllFeeds();
    if (scraped.length === 0) {
      console.log('[Scheduler] Geen artikelen gevonden');
      return;
    }

    const ranked = rankArticles(scraped);
    const bulletins = await generateRadioBulletins(ranked);
    const taggedBulletins = bulletins.map(b => ({ ...b, timeSlot }));

    const newTimeSlot = {
      timeSlot,
      generatedAt: now.toISOString(),
      bulletins: taggedBulletins,
    };

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
      output.radioBulletins = taggedBulletins;
      output.articles = ranked;
      if (!output.radioTimeSlots) output.radioTimeSlots = [];
      const existingIdx = output.radioTimeSlots.findIndex(s => s.timeSlot === timeSlot);
      if (existingIdx >= 0) {
        output.radioTimeSlots[existingIdx] = newTimeSlot;
      } else {
        output.radioTimeSlots.push(newTimeSlot);
      }
    }

    await saveDailyOutput(output);
    console.log(`[Scheduler] Radio update klaar! ${taggedBulletins.length} bulletins voor ${timeSlot} (${output.radioTimeSlots.length} updates vandaag)`);
  } catch (error) {
    console.error('[Scheduler] Radio update fout:', error instanceof Error ? error.message : error);
  }
}

export function startScheduler() {
  if (isSchedulerRunning) {
    console.log('[Scheduler] Al actief, overgeslagen');
    return;
  }

  isSchedulerRunning = true;

  // Volledige pipeline: 1x per dag om 07:00
  cron.schedule(CRON_SCHEDULE, () => {
    console.log(`[Scheduler] Dagelijkse pipeline getriggerd (${new Date().toLocaleTimeString()})`);
    runFullPipeline();
  });

  // Radio bulletins: 4x per dag — 07:00, 11:00, 15:00, 19:00
  // Skip 07:00 voor radio want de volledige pipeline draait dan al
  cron.schedule('0 11,15,19 * * *', () => {
    console.log(`[Scheduler] Radio update getriggerd (${new Date().toLocaleTimeString()})`);
    runRadioUpdate();
  });

  console.log('[Scheduler] Gestart!');
  console.log('[Scheduler] Volledige pipeline: elke dag om 07:00');
  console.log('[Scheduler] Radio bulletins: 07:00, 11:00, 15:00, 19:00');
}
