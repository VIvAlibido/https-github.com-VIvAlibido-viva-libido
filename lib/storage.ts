import fs from 'fs/promises';
import path from 'path';
import { DailyOutput } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // directory exists
  }
}

function getFilePath(date: string): string {
  return path.join(DATA_DIR, `${date}.json`);
}

export async function saveDailyOutput(output: DailyOutput): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(getFilePath(output.date), JSON.stringify(output, null, 2), 'utf-8');
}

export async function loadDailyOutput(date: string): Promise<DailyOutput | null> {
  try {
    const content = await fs.readFile(getFilePath(date), 'utf-8');
    return JSON.parse(content) as DailyOutput;
  } catch {
    return null;
  }
}

export async function listAvailableDates(): Promise<string[]> {
  await ensureDataDir();
  const files = await fs.readdir(DATA_DIR);
  return files
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort()
    .reverse();
}

export async function getLatestOutput(): Promise<DailyOutput | null> {
  const dates = await listAvailableDates();
  if (dates.length === 0) return null;
  return loadDailyOutput(dates[0]);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
