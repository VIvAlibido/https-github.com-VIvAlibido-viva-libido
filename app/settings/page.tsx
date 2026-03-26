'use client';

import { useState } from 'react';
import { FEED_SOURCES } from '@/lib/config';

export default function SettingsPage() {
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);

  const testScrape = async () => {
    setScrapeLoading(true);
    setScrapeStatus('Scraping feeds...');
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      setScrapeStatus(`Found ${data.total} articles total, selected top ${data.top10}`);
    } catch (err) {
      setScrapeStatus(`Error: ${err instanceof Error ? err.message : 'Failed'}`);
    } finally {
      setScrapeLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure feeds and test the pipeline</p>
      </div>

      {/* Test Scraper */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Test Scraper</h2>
            <p className="text-sm text-gray-500">Run just the scrape step to verify feeds are working</p>
          </div>
          <button
            onClick={testScrape}
            disabled={scrapeLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              scrapeLoading ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'
            }`}
          >
            {scrapeLoading ? 'Testing...' : 'Test Scrape'}
          </button>
        </div>
        {scrapeStatus && (
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{scrapeStatus}</p>
        )}
      </div>

      {/* Feed Sources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Configured RSS Feeds</h2>
        <div className="space-y-3">
          {FEED_SOURCES.map((feed, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-800">{feed.name}</p>
                <p className="text-xs text-gray-400 font-mono truncate max-w-md">{feed.url}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  feed.language === 'es' ? 'bg-orange-100 text-orange-700' :
                  feed.language === 'en' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {feed.language.toUpperCase()}
                </span>
                <span className={`w-2 h-2 rounded-full ${feed.enabled ? 'bg-green-400' : 'bg-gray-300'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Environment Setup</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">ANTHROPIC_API_KEY</span>
            <span className="text-gray-400">Set in .env.local</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">UNSPLASH_ACCESS_KEY</span>
            <span className="text-gray-400">Set in .env.local (optional)</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">CRON_SECRET</span>
            <span className="text-gray-400">Set in .env.local (optional)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
