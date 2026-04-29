'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_PATHS = ['/auth'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('pb_token') : null;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!token && !isPublic) {
      router.replace('/auth');
    } else if (token && isPublic) {
      router.replace('/dashboard');
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) {
    // Render nothing while the auth check resolves to avoid flash
    return null;
  }

  return <>{children}</>;
}
