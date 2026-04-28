'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Payment } from '@/types';

const statusColour: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  succeeded: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
};

export function PaymentList() {
  const { data, isLoading, error } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments'),
  });

  if (isLoading) return <p className="text-slate-400">Loading payments…</p>;
  if (error) return <p className="text-red-500">Failed to load payments.</p>;
  if (!data?.length) return <p className="text-slate-400">No payments yet.</p>;

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Amount</th>
            <th className="px-4 py-3 text-left">Currency</th>
            <th className="px-4 py-3 text-left">Method</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono text-xs text-slate-400">
                {p.id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3 font-semibold">{p.amount}</td>
              <td className="px-4 py-3 uppercase">{p.currency}</td>
              <td className="px-4 py-3 capitalize">{p.method}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColour[p.status] ?? ''}`}
                >
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(p.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
