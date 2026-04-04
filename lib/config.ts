import { FeedSource } from './types';

export const RELEVANCE_KEYWORDS = [
  'ibiza', 'eivissa', 'formentera', 'pitiusas', 'pitiüses',
  'balearic', 'baleares', 'balears',
  'sant antoni', 'san antonio', 'santa eulalia', 'santa eulària',
  'sant josep', 'san josé', 'sant joan', 'san juan',
  'dalt vila', 'playa d\'en bossa', 'es canar', 'cala conta',
  'es pujols', 'la savina', 'sant francesc', 'ses salines',
];

export const FEED_SOURCES: FeedSource[] = [
  // Spanish sources - Google News (haalt uit alle Spaanse kranten)
  {
    name: 'Google News ES - Ibiza',
    url: 'https://news.google.com/rss/search?q=Ibiza+OR+Formentera&hl=es&gl=ES&ceid=ES:es',
    language: 'es',
    enabled: true,
  },
  {
    name: 'Google News ES - Eivissa',
    url: 'https://news.google.com/rss/search?q=Eivissa+OR+Pitiusas&hl=es&gl=ES&ceid=ES:es',
    language: 'es',
    enabled: true,
  },
  // Events & Culture feeds
  {
    name: 'Google News ES - Ibiza Eventos',
    url: 'https://news.google.com/rss/search?q=Ibiza+eventos+OR+Ibiza+cultura+OR+Ibiza+fiesta+OR+Formentera+festival&hl=es&gl=ES&ceid=ES:es',
    language: 'es',
    enabled: true,
  },
  {
    name: 'Google News EN - Ibiza Events',
    url: 'https://news.google.com/rss/search?q=Ibiza+events+OR+Ibiza+festival+OR+Ibiza+culture+OR+Ibiza+party+OR+Formentera+events&hl=en&gl=US&ceid=US:en',
    language: 'en',
    enabled: true,
  },
  // English sources
  {
    name: 'Google News EN - Ibiza',
    url: 'https://news.google.com/rss/search?q=Ibiza+OR+Formentera&hl=en&gl=US&ceid=US:en',
    language: 'en',
    enabled: true,
  },
  // Dutch sources
  {
    name: 'Google News NL - Ibiza',
    url: 'https://news.google.com/rss/search?q=Ibiza+OR+Formentera&hl=nl&gl=NL&ceid=NL:nl',
    language: 'nl',
    enabled: true,
  },
  // Direct Spanish newspaper feeds
  {
    name: 'Diario de Ibiza',
    url: 'https://www.diariodeibiza.es/rss/',
    language: 'es',
    enabled: true,
  },
  {
    name: 'Periódico de Ibiza',
    url: 'https://www.periodicodeibiza.es/rss/',
    language: 'es',
    enabled: true,
  },
  {
    name: 'Última Hora Ibiza',
    url: 'https://www.ultimahora.es/rss/ibiza.xml',
    language: 'es',
    enabled: true,
  },
];

export const MAX_ARTICLES = 10;
export const RADIO_BULLETIN_COUNT = 5;
export const WORDS_PER_BULLETIN = 65; // ~25 seconds at broadcast pace

// Schedule: volledige pipeline 1x per dag om 07:00
export const CRON_SCHEDULE = '0 7 * * *';

// Radio bulletins: 4x per dag — 07:00, 11:00, 15:00, 19:00
export const RADIO_TIMES = ['07:00', '11:00', '15:00', '19:00'];
export const RADIO_CRON_SCHEDULE = '0 7,11,15,19 * * *';

export const SOCIAL_LIMITS = {
  instagram: 2200,
  facebook: 500,
  app: 280,
} as const;
