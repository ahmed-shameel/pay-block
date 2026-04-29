'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, displayName };

      const response = await api.post<{ access_token: string }>(endpoint, body);
      
      // Store token
      if (typeof window !== 'undefined') {
        localStorage.setItem('pb_token', response.access_token);
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {mode === 'login'
              ? 'Sign in to your PayBlock account'
              : 'Create a new PayBlock account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading…' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                className="ml-1 text-brand-600 font-semibold hover:text-brand-700"
              >
                {mode === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
