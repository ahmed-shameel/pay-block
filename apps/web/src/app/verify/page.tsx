'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface VerifyResult {
  verified: boolean;
  blockchainTxHash: string | null;
}

export default function VerifyPage() {
  const [paymentId, setPaymentId] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!paymentId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<VerifyResult>(`/payments/${paymentId}/verify`);
      setResult(data);
    } catch {
      setError('Payment not found or verification failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Verify Payment</h1>
      <p className="text-slate-500">
        Enter a payment ID to verify its proof on-chain. Anyone can use this
        public tool without authentication.
      </p>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Payment UUID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.verified
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}
        >
          <p className="font-semibold">
            {result.verified ? '✅ Proof verified on-chain' : '⚠️ Proof not found on-chain'}
          </p>
          {result.blockchainTxHash && (
            <p className="mt-2 text-sm font-mono break-all">
              Tx: {result.blockchainTxHash}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
