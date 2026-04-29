import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { AuthLayoutShell } from '@/components/layout/AuthLayoutShell';

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
          <AuthGuard>
            <AuthLayoutShell>{children}</AuthLayoutShell>
          </AuthGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
