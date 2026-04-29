'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

const PUBLIC_PATHS = ['/auth'];

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) {
    return <main className="flex-1 p-8">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </>
  );
}
