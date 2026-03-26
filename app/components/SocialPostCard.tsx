'use client';

import { SocialPost } from '@/lib/types';
import CopyButton from './CopyButton';

const platformStyles = {
  instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700' },
  facebook: { label: 'Facebook', color: 'bg-blue-100 text-blue-700' },
  app: { label: 'App', color: 'bg-green-100 text-green-700' },
};

export default function SocialPostCard({ post }: { post: SocialPost }) {
  const style = platformStyles[post.platform];
  const fullText = post.hashtags.length > 0
    ? `${post.text}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`
    : post.text;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.color}`}>
            {style.label}
          </span>
          <span className="text-gray-400 text-xs">{post.text.length} chars</span>
        </div>
        <CopyButton text={fullText} />
      </div>
      <h4 className="font-medium text-gray-800 text-sm mb-2">{post.title}</h4>
      <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{post.text}</p>
      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.hashtags.map(tag => (
            <span key={tag} className="text-blue-500 text-xs">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
