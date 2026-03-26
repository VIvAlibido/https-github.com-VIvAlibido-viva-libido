'use client';

import { useState, useEffect } from 'react';
import { RadioBulletin, Language } from '@/lib/types';
import LanguageTabs from '../components/LanguageTabs';
import RadioBulletinCard from '../components/RadioBulletinCard';
import CopyButton from '../components/CopyButton';

export default function RadioPage() {
  const [bulletins, setBulletins] = useState<RadioBulletin[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/radio?date=${today}`)
      .then(res => res.json())
      .then(data => {
        setBulletins(data.bulletins || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = bulletins.filter(b => b.language === language);
  const intro = filtered[0]?.intro || '';
  const outro = filtered[0]?.outro || '';

  const fullScript = [
    intro,
    ...filtered.map(b => b.text),
    outro,
  ].filter(Boolean).join('\n\n');

  const totalWords = filtered.reduce((sum, b) => sum + b.wordCount, 0);
  const totalSeconds = filtered.reduce((sum, b) => sum + b.estimatedSeconds, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Radio Bulletins</h1>
        <p className="text-gray-500 mt-1">2-minute news bulletin for Ibiza radio</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <LanguageTabs active={language} onChange={setLanguage} />
        {filtered.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {totalWords} words | ~{totalSeconds}s total
            </span>
            <CopyButton text={fullScript} label="Copy Full Script" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No radio bulletins yet</p>
          <p className="text-sm mt-1">Run the pipeline from the Dashboard first</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Intro */}
          {intro && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-semibold text-sm">INTRO</span>
                <CopyButton text={intro} />
              </div>
              <p className="text-blue-800 text-sm">{intro}</p>
            </div>
          )}

          {/* Bulletins */}
          {filtered.map(bulletin => (
            <RadioBulletinCard
              key={`${bulletin.bulletinNumber}-${bulletin.language}`}
              bulletin={bulletin}
            />
          ))}

          {/* Outro */}
          {outro && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-semibold text-sm">OUTRO</span>
                <CopyButton text={outro} />
              </div>
              <p className="text-blue-800 text-sm">{outro}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
