'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Payment, Contract } from '@/types';

export function StatsCards() {
  const { data: payments } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments'),
  });

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: () => api.get('/contracts'),
  });

  const totalVolume =
    payments
      ?.filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const activeContracts =
    contracts?.filter((c) => c.status === 'active').length ?? 0;

  const stats = [
    { label: 'Total Volume (cents)', value: totalVolume.toLocaleString() },
    { label: 'Payments', value: payments?.length ?? '–' },
    { label: 'Active Contracts', value: activeContracts },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-slate-500">{s.label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
