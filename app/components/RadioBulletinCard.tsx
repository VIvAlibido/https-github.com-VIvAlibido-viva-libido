'use client';

import { RadioBulletin } from '@/lib/types';
import CopyButton from './CopyButton';

export default function RadioBulletinCard({ bulletin }: { bulletin: RadioBulletin }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
            {bulletin.bulletinNumber}
          </span>
          <div className="text-xs text-gray-400">
            {bulletin.wordCount} woorden | ~{bulletin.estimatedSeconds}s
          </div>
        </div>
        <CopyButton text={bulletin.text} />
      </div>
      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
        {bulletin.text}
      </p>
    </div>
  );
}
