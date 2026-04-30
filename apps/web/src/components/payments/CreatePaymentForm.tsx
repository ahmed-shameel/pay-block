'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, getApiErrorMessage } from '@/lib/api';

export function CreatePaymentForm() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/payments', { amount: Number(amount), currency });
      await queryClient.invalidateQueries({ queryKey: ['payments'] });
      setOpen(false);
      setAmount('');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setError('');
          setOpen(true);
        }}
        className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
      >
        + New Payment
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 shadow-xl w-80 space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-800">Create Payment</h2>

            <div>
              <label
                htmlFor="payment-amount"
                className="block text-sm text-slate-600 mb-1"
              >
                Amount (cents)
              </label>
              <input
                id="payment-amount"
                type="number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={1}
              />
            </div>

            <div>
              <label
                htmlFor="payment-currency"
                className="block text-sm text-slate-600 mb-1"
              >
                Currency
              </label>
              <select
                id="payment-currency"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError('');
                }}
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
