'use client';

import { useRewardReports } from '@/lib/hooks/useRewards';
import { useStacksAuth } from '@/lib/providers/AppKitProvider';

export default function RewardHistoryPage() {
  const { stxAddress: address, isConnected } = useStacksAuth();
  const { reports, loading } = useRewardReports();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="p-12 glass-card rounded-[2.5rem] border border-white/10 text-center max-w-md">
          <p className="text-gray-400 text-lg">Please connect your wallet to view your earning history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-12">
          Reward History
        </h1>

        {loading ? (
          <div className="glass-card p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-400 font-medium">Retrieving transaction history...</p>
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.reportId} className="glass-card p-8 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-6 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{report.reason}</p>
                    <p className="text-sm text-gray-400">{new Date(report.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-400">+{report.rewardAmount} STX</p>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Received</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-20 rounded-[3rem] border border-white/10 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-xl font-medium">Your rewards history is empty.</p>
            <p className="text-gray-600 mt-2">Start reporting spot inaccuracies to earn Stacks rewards.</p>
          </div>
        )}
      </div>
    </div>
  );
}
