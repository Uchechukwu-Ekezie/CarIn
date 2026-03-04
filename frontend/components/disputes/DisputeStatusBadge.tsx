'use client';

import { ResolutionType } from '@/lib/contracts/disputeResolution';

interface DisputeStatusBadgeProps {
  isResolved: boolean;
  refundApproved: boolean | null;
  resolutionType: ResolutionType;
  refundPercentage?: number;
}

export default function DisputeStatusBadge({
  isResolved,
  refundApproved,
  resolutionType,
  refundPercentage
}: DisputeStatusBadgeProps) {
  if (isResolved) {
    if (refundApproved) {
      const percent = refundPercentage !== undefined ? Number(refundPercentage) : 100;
      return (
        <span className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10 animate-fade-in">
          REFUND {percent}%
        </span>
      );
    }
    return (
      <span className="px-5 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-500/10 animate-fade-in">
        DENIED
      </span>
    );
  }

  switch (resolutionType) {
    case ResolutionType.Automated:
      return (
        <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse shadow-lg shadow-indigo-500/10">
          SCANNING
        </span>
      );
    case ResolutionType.PendingVote:
      return (
        <span className="px-5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse shadow-lg shadow-amber-500/10">
          VOTING
        </span>
      );
    case ResolutionType.Manual:
      return (
        <span className="px-5 py-2 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-white/5">
          REVIEW
        </span>
      );
    default:
      return (
        <span className="px-5 py-2 bg-white/5 border border-white/10 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
          PENDING
        </span>
      );
  }
}
