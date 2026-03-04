'use client';

import { useStacksAuth } from '@/lib/providers/AppKitProvider';
import Link from 'next/link';

export default function DisputesPage() {
  const { isConnected } = useStacksAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent mb-6">
            Resolution Center
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Fair and transparent dispute resolution powered by the Stacks blockchain. Open a case or track your existing disputes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/[0.05] transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">File a Dispute</h2>
              <p className="text-gray-400 mb-8">Problem with your booking? Submit evidence and our automated resolution system or community moderators will review your case.</p>
            </div>
            <button className="w-full py-4 bg-white/5 group-hover:bg-white text-gray-400 group-hover:text-black font-bold rounded-2xl border border-white/10 group-hover:border-white transition-all">
              Start New Case
            </button>
          </div>

          <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/[0.05] transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 mb-8 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Track Disputes</h2>
              <p className="text-gray-400 mb-8">View the status of your active disputes, see community votes, and receive updates on settlements directly on-chain.</p>
            </div>
            <button className="w-full py-4 bg-white/5 group-hover:bg-white text-gray-400 group-hover:text-black font-bold rounded-2xl border border-white/10 group-hover:border-white transition-all">
              View My Cases
            </button>
          </div>
        </div>

        <div className="p-10 glass-card rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent flex flex-wrap items-center justify-between gap-8">
          <div className="flex-1 min-w-[300px]">
            <h3 className="text-xl font-bold text-white mb-2">Moderator Portal</h3>
            <p className="text-gray-400">Authorized community moderators can review cases and provide final manual resolutions.</p>
          </div>
          <Link
            href="/admin/disputes"
            className="px-8 py-4 bg-white text-black font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            Enter Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
