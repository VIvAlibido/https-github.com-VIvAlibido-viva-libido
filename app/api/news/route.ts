import { NextResponse } from 'next/server';
import { loadDailyOutput, getTodayDate } from '@/lib/storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getTodayDate();

  const output = await loadDailyOutput(date);
  if (!output) {
    return NextResponse.json({ articles: [], date });
  }

  return NextResponse.json({
    date: output.date,
    status: output.pipelineStatus,
    articles: output.articles,
  });
}
