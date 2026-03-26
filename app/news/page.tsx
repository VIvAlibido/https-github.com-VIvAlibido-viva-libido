'use client';

import { useState, useEffect } from 'react';
import { RankedArticle } from '@/lib/types';
import NewsCard from '../components/NewsCard';

export default function NewsPage() {
  const [articles, setArticles] = useState<RankedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/news?date=${today}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">News</h1>
        <p className="text-gray-500 mt-1">Top 10 Ibiza & Formentera stories</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No articles yet</p>
          <p className="text-sm mt-1">Run the pipeline from the Dashboard first</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
