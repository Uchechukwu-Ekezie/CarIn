"use client";

import { useRewards } from "@/lib/hooks/useRewards";
import { useStacksAuth } from "@/lib/providers/AppKitProvider";

export default function RewardsPage() {
  const { stxAddress: address, isConnected } = useStacksAuth();
  const { balance, loading, error, claimReward, claimAllRewards } = useRewards();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="p-12 glass-card rounded-[2.5rem] border border-white/10 max-w-lg w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Rewards Center</h1>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">Connect your Stacks wallet to view your accumulated rewards and bonuses.</p>
        </div>
      </div>
    );
  }

  const handleClaimReward = async (rewardType: any) => {
    try {
      await claimReward(rewardType);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 p-10 glass-card rounded-[3rem] border border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-6">
              Stacks Rewards
            </h1>

            {balance && (
              <div className="flex flex-wrap gap-8 items-end">
                <div>
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Total Balance</p>
                  <p className="text-5xl font-black text-white">{balance.balance} <span className="text-2xl font-medium text-gray-500">STX</span></p>
                </div>
                <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Pending Claim</p>
                  <p className="text-3xl font-bold text-emerald-400">{balance.pendingTotal} STX</p>
                </div>
              </div>
            )}
          </div>
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] -mr-48 -mt-48 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { name: 'Inaccuracy Reports', key: 'inaccuracyReport', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { name: 'Spot Sharing', key: 'spotShare', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
            { name: 'Referral Rewards', key: 'referral', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { name: 'Community Contributions', key: 'communityContribution', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' }
          ].map((item) => (
            <div key={item.key} className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-between group hover:bg-white/[0.07] transition-all">
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {balance ? (balance.pendingByType as any)[item.key] : '0.00'}
                  </p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-tighter">STX</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                {balance && parseFloat((balance.pendingByType as any)[item.key]) > 0 && (
                  <button
                    onClick={() => handleClaimReward(item.key)}
                    className="w-full mt-4 py-3 bg-white/5 hover:bg-white text-gray-400 hover:text-black font-bold rounded-2xl border border-white/10 hover:border-white transition-all active:scale-95"
                  >
                    Claim Reward
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {balance && parseFloat(balance.pendingTotal) > 0 && (
          <button
            onClick={claimAllRewards}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-black text-lg rounded-[2rem] shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Claim All Available Rewards ({balance.pendingTotal} STX)
          </button>
        )}
      </div>
    </div>
  );
}
