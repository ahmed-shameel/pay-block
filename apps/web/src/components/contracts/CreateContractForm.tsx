'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function CreateContractForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'escrow' | 'milestone' | 'subscription'>('escrow');
  const [beneficiaryRef, setBeneficiaryRef] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contracts', {
        type,
        beneficiaryRef,
        amount: Number(amount),
        currency,
      });
      await queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setOpen(false);
      setBeneficiaryRef('');
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
      >
        + New Contract
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 shadow-xl w-96 space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-800">Create Contract</h2>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Type</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as 'escrow' | 'milestone' | 'subscription')
                }
              >
                <option value="escrow">Escrow</option>
                <option value="milestone">Milestone</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Beneficiary (email or wallet)
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={beneficiaryRef}
                onChange={(e) => setBeneficiaryRef(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm text-slate-600 mb-1">
                  Amount (cents)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min={1}
                />
              </div>
              <div className="w-24">
                <label className="block text-sm text-slate-600 mb-1">Currency</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
