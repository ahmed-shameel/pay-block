'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentList } from '@/components/payments/PaymentList';
import { ContractList } from '@/components/contracts/ContractList';
import { StatsCards } from '@/components/layout/StatsCards';

export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pb_token');
      if (!token) {
        router.push('/auth');
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Recent Payments</h2>
          <PaymentList />
        </section>
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Active Contracts</h2>
          <ContractList />
        </section>
      </div>
    </div>
  );
}
