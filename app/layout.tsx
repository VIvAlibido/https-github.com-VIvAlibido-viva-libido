import './globals.css';
import type { Metadata } from 'next';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: 'Ibiza News Aggregator',
  description: 'Daily news aggregation for Ibiza & Formentera - Social posts & radio bulletins',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
