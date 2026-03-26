import { RankedArticle } from '@/lib/types';

export default function NewsCard({ article }: { article: RankedArticle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {article.imageUrl && (
        <div className="h-48 bg-gray-100 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
            #{article.rank}
          </span>
          <span className="text-gray-400 text-xs">{article.source}</span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-gray-400 text-xs">Score: {article.score}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {article.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">
            {new Date(article.pubDate).toLocaleDateString()}
          </span>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:underline"
          >
            Lees origineel
          </a>
        </div>
        {article.imageCredit && (
          <p className="text-gray-300 text-xs mt-2">{article.imageCredit}</p>
        )}
      </div>
    </div>
  );
}
