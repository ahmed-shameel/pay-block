import Link from 'next/link';

/** Landing page – redirects authenticated users to /dashboard */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-brand-700 tracking-tight">
          Pay<span className="text-slate-800">Block</span>
        </h1>
        <p className="mt-4 text-xl text-slate-600 max-w-xl">
          Hybrid payment platform combining Stripe fiat payments with
          blockchain-verified, programmable payment contracts.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
        >
          Open Dashboard
        </Link>
        <a
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-lg border border-brand-600 text-brand-600 font-semibold hover:bg-brand-50 transition-colors"
        >
          API Docs
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
        {[
          { title: 'Stripe Payments', desc: 'Accept fiat payments with automatic blockchain proof anchoring.' },
          { title: 'Smart Contracts', desc: 'Escrow, milestone & subscription contracts deployed to Polygon.' },
          { title: 'Public Verification', desc: 'Anyone can verify a payment proof on-chain using the payment ID.' },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-800">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
