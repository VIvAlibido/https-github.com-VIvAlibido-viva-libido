import { NextResponse } from 'next/server';
import { loadDailyOutput, getTodayDate } from '@/lib/storage';
import { Language } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getTodayDate();
  const language = searchParams.get('language') as Language | null;

  const output = await loadDailyOutput(date);
  if (!output) {
    return NextResponse.json({ bulletins: [], date });
  }

  let bulletins = output.radioBulletins;
  if (language) bulletins = bulletins.filter(b => b.language === language);

  return NextResponse.json({ date: output.date, bulletins });
}
