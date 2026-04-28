import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'PayBlock – Hybrid Payment Platform',
  description:
    'Fiat + blockchain-verified payments with programmable payment contracts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50">
        <QueryProvider>
          <Sidebar />
          <main className="flex-1 p-8">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
