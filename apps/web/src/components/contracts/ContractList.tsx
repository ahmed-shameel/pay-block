'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Contract } from '@/types';

const statusColour: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  disputed: 'bg-orange-100 text-orange-700',
};

export function ContractList() {
  const { data, isLoading, error } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: () => api.get('/contracts'),
  });

  if (isLoading) return <p className="text-slate-400">Loading contracts…</p>;
  if (error) return <p className="text-red-500">Failed to load contracts.</p>;
  if (!data?.length) return <p className="text-slate-400">No contracts yet.</p>;

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">On-Chain</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-slate-400">
                {c.id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3 capitalize">{c.type}</td>
              <td className="px-4 py-3 font-semibold">
                {c.amount} <span className="uppercase text-slate-400">{c.currency}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColour[c.status] ?? ''}`}
                >
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400">
                {c.onChainAddress ? `${c.onChainAddress.slice(0, 10)}…` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
