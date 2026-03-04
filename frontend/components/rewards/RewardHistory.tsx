"use client";

import { useRewardReports, useReferrals } from "@/lib/hooks/useRewards";
import { formatDistanceToNow } from "date-fns";

const formatTimeAgo = (timestamp: number) => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return "recently";
  }
};

export default function RewardHistory() {
  const { reports, loading: reportsLoading } = useRewardReports();
  const { referrals, loading: referralsLoading } = useReferrals();

  const loading = reportsLoading || referralsLoading;

  const getClaimStatusBadge = (status: number) => {
    switch (status) {
      case 0: // Pending
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>;
      case 1: // Approved
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">Approved</span>;
      case 2: // Rejected
        return <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest">Rejected</span>;
      case 3: // Claimed
        return <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">Claimed</span>;
      default:
        return <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">Processing</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-12 glass-card border border-white/10 rounded-[3rem] text-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Retrieving audit history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Reports History */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Intelligence Logs</h2>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Submission Audit Trail</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-500/50 uppercase tracking-widest">{reports.length} Records</span>
        </div>

        {reports.length === 0 ? (
          <div className="p-16 glass-card border border-white/10 rounded-[2.5rem] text-center">
            <p className="text-gray-500 text-sm italic">No intelligence reports documented.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div key={report.reportId} className="p-6 glass-card border border-white/10 rounded-[1.5rem] group hover:bg-white/[0.04] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white mb-1">Parking Node #{report.spotId}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-md">{report.reason}</p>
                  </div>
                  {getClaimStatusBadge(report.claimStatus)}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{formatTimeAgo(report.timestamp)}</span>
                  {report.rewardAmount !== "0.0" && (
                    <span className="text-sm font-black text-emerald-400 tracking-tight">
                      +{report.rewardAmount} STX
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referrals History */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Network Growth</h2>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Successful Designations</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-500/50 uppercase tracking-widest">{referrals.length} Records</span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-16 glass-card border border-white/10 rounded-[2.5rem] text-center">
            <p className="text-gray-500 text-sm italic">No referral designations found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {referrals.map((referral) => (
              <div key={referral.referralHash} className="p-6 glass-card border border-white/10 rounded-[1.5rem] group hover:bg-white/[0.04] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white mb-1">Node #{referral.spotId}</h3>
                    <p className="text-[10px] font-mono text-indigo-400">
                      Target: {referral.referee.slice(0, 10)}...{referral.referee.slice(-6)}
                    </p>
                  </div>
                  {getClaimStatusBadge(referral.claimStatus)}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{formatTimeAgo(referral.timestamp)}</span>
                  {referral.rewardAmount !== "0.0" && (
                    <span className="text-sm font-black text-emerald-400 tracking-tight">
                      +{referral.rewardAmount} STX
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
