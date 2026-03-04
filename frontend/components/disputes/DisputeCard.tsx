'use client';

import { DisputeDetails } from '@/lib/contracts/disputeResolution';
import { formatDistanceToNow } from 'date-fns';
import DisputeStatusBadge from './DisputeStatusBadge';

interface DisputeCardProps {
  dispute: DisputeDetails;
  onClick?: () => void;
}

export default function DisputeCard({ dispute, onClick }: DisputeCardProps) {

  return (
    <div
      onClick={onClick}
      className="p-8 glass-card border border-white/10 rounded-[2rem] hover:bg-white/[0.05] transition-all group relative overflow-hidden cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            Dispute #{dispute.disputeId}
          </h3>
          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 uppercase tracking-widest">
            <span>Booking #{dispute.bookingId}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>Escrow #{dispute.escrowId}</span>
          </div>
        </div>
        <DisputeStatusBadge
          isResolved={dispute.isResolved}
          refundApproved={dispute.isResolved ? dispute.refundApproved : null}
          resolutionType={dispute.resolutionType}
          refundPercentage={dispute.refundPercentage}
        />
      </div>

      <div className="mb-8 relative z-10">
        <p className="text-gray-400 leading-relaxed line-clamp-2">{dispute.reason}</p>
      </div>

      <div className="flex justify-between items-end text-sm relative z-10">
        <div className="space-y-1">
          <p className="text-gray-500">
            Filed by <span className="text-white font-medium">{dispute.filedBy.slice(0, 6)}...{dispute.filedBy.slice(-4)}</span>
          </p>
          <p className="text-xs text-indigo-400/70 font-medium">
            {formatDistanceToNow(new Date(dispute.filedAt), { addSuffix: true })}
          </p>
        </div>

        {dispute.isResolved && dispute.resolvedAt > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end text-emerald-400 font-bold mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span>RESOLVED</span>
            </div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
              {formatDistanceToNow(new Date(dispute.resolvedAt), { addSuffix: true })}
            </p>
          </div>
        )}
      </div>

      {/* Subtle interaction background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>
    </div>
  );
}
