import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viva Libido - Embrace Your Vitality',
  description:
    'Viva Libido helps you rediscover your energy, confidence, and vitality. Personalized wellness solutions for a more vibrant life.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
