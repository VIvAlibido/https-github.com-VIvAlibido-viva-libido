'use client';

import { Language } from '@/lib/types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espa\u00f1ol' },
  { code: 'nl', label: 'Nederlands' },
];

export default function LanguageTabs({
  active,
  onChange,
}: {
  active: Language;
  onChange: (lang: Language) => void;
}) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            active === lang.code
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
