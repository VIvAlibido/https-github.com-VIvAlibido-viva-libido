'use client';

import { useState, useEffect } from 'react';
import { SocialPost, Language, Platform } from '@/lib/types';
import LanguageTabs from '../components/LanguageTabs';
import SocialPostCard from '../components/SocialPostCard';

const platforms: { value: Platform | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'app', label: 'App' },
];

export default function SocialPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [platform, setPlatform] = useState<Platform | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/social?date=${today}`)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    if (p.language !== language) return false;
    if (platform !== 'all' && p.platform !== platform) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Social Media Posts</h1>
        <p className="text-gray-500 mt-1">Publiceerbare content voor Instagram, Facebook & App</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <LanguageTabs active={language} onChange={setLanguage} />
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {platforms.map(p => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                platform === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Laden...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nog geen social media posts</p>
          <p className="text-sm mt-1">Start eerst de pipeline via het Dashboard</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((post, i) => (
            <SocialPostCard key={`${post.articleId}-${post.platform}-${post.language}-${i}`} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
