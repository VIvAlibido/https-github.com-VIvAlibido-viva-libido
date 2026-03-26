import { NextResponse } from 'next/server';
import { loadDailyOutput, getTodayDate } from '@/lib/storage';
import { Language, Platform } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getTodayDate();
  const platform = searchParams.get('platform') as Platform | null;
  const language = searchParams.get('language') as Language | null;

  const output = await loadDailyOutput(date);
  if (!output) {
    return NextResponse.json({ posts: [], date });
  }

  let posts = output.socialPosts;
  if (platform) posts = posts.filter(p => p.platform === platform);
  if (language) posts = posts.filter(p => p.language === language);

  return NextResponse.json({ date: output.date, posts });
}
