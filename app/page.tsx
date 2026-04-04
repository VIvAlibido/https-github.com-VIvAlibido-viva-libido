'use client';

import { useState, useEffect } from 'react';
import { DailyOutput } from '@/lib/types';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [data, setData] = useState<DailyOutput | null>(null);

  useEffect(() => {
    loadTodayData();
  }, []);

  const runPipeline = async () => {
    setLoading(true);
    setStatus('Pipeline draait... Dit kan enkele minuten duren.');
    try {
      const res = await fetch('/api/cron', { method: 'POST' });
      const result = await res.json();
      if (result.status === 'complete') {
        setStatus(`Klaar! ${result.articles} artikelen, ${result.socialPosts} social media posts, ${result.radioBulletins} radio bulletins`);
        loadTodayData();
      } else {
        setStatus(`Fout: ${result.error}`);
      }
    } catch (err) {
      setStatus(`Mislukt: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [newsRes, socialRes, radioRes] = await Promise.all([
        fetch(`/api/news?date=${today}`),
        fetch(`/api/social?date=${today}`),
        fetch(`/api/radio?date=${today}`),
      ]);
      const [news, social, radio] = await Promise.all([
        newsRes.json(),
        socialRes.json(),
        radioRes.json(),
      ]);
      setData({
        date: today,
        articles: news.articles || [],
        socialPosts: social.posts || [],
        radioBulletins: radio.bulletins || [],
        radioTimeSlots: radio.timeSlots || [],
        pipelineStatus: news.status || 'pending',
      });
    } catch {
      // Data not available yet
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ibiza Nieuws Dashboard</h1>
        <p className="text-gray-500 mt-1">Dagelijkse nieuwsverzameling voor Ibiza & Formentera</p>
      </div>

      {/* Pipeline Control */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Dagelijkse Pipeline</h2>
            <p className="text-sm text-gray-500">Nieuws scrapen, social media posts & radio bulletins genereren</p>
          </div>
          <button
            onClick={runPipeline}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Bezig...' : 'Start Pipeline'}
          </button>
        </div>
        {status && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            status.startsWith('Klaar') ? 'bg-green-50 text-green-700' :
            status.startsWith('Fout') || status.startsWith('Mislukt') ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {status}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Artikelen"
          value={data?.articles.length || 0}
          subtitle="Beste nieuwsberichten"
          color="blue"
        />
        <StatCard
          title="Social Media Posts"
          value={data?.socialPosts.length || 0}
          subtitle="3 platforms x 3 talen"
          color="pink"
        />
        <StatCard
          title="Radio Bulletins"
          value={data?.radioTimeSlots?.length || 0}
          subtitle="4x per dag (07, 11, 15, 19u)"
          color="amber"
        />
        <StatCard
          title="Status"
          value={data?.pipelineStatus || 'idle'}
          subtitle={data?.date || 'Nog geen data'}
          color="green"
          isText
        />
      </div>

      {/* Quick Preview */}
      {data && data.articles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Verhalen van Vandaag</h2>
          <div className="space-y-3">
            {data.articles.slice(0, 5).map(article => (
              <div key={article.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold flex-shrink-0">
                  #{article.rank}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{article.title}</p>
                  <p className="text-xs text-gray-400">{article.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data?.articles.length && !loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nog geen data voor vandaag</p>
          <p className="text-sm mt-1">Klik op &quot;Start Pipeline&quot; om te beginnen</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, color, isText }: {
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
  isText?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    pink: 'text-pink-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`${isText ? 'text-lg' : 'text-3xl'} font-bold mt-1 ${colorMap[color] || 'text-gray-900'}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}
