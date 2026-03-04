'use client';

import { useState } from 'react';
import { useStacksAuth } from '@/lib/providers/AppKitProvider';
import { useDisputeResolution, useDisputeDetails, useDisputeEvidence, useDisputeVotes } from '@/lib/hooks/useDisputeResolution';
import { ResolutionType } from '@/lib/contracts/disputeResolution';
// EvidenceDisplay might need update if it uses wagmi/viem
// import EvidenceDisplay from './EvidenceDisplay'; 

interface AdminDisputePanelProps {
  disputeId: string;
}

export default function AdminDisputePanel({ disputeId }: AdminDisputePanelProps) {
  const { stxAddress: address } = useStacksAuth();
  const { dispute, isLoading: loadingDispute } = useDisputeDetails(disputeId);
  const { evidence, isLoading: loadingEvidence } = useDisputeEvidence(disputeId);
  const { votes, isLoading: loadingVotes } = useDisputeVotes(disputeId);
  const { resolveDisputeManually, submitVote, isPending } = useDisputeResolution();

  const [refundApproved, setRefundApproved] = useState(true);
  const [refundPercentage, setRefundPercentage] = useState(100);
  const [voteJustification, setVoteJustification] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleManualResolution = async () => {
    if (!dispute || resolving) return;
    setResolving(true);
    try {
      await resolveDisputeManually(disputeId, refundApproved, refundPercentage);
    } catch (error) {
      console.error('Resolution error:', error);
      setResolving(false);
    }
  };

  const handleVote = async () => {
    if (!voteJustification.trim()) {
      alert('Please provide a justification for your vote');
      return;
    }
    try {
      await submitVote(disputeId, refundApproved, refundPercentage, voteJustification);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  if (loadingDispute || !dispute) {
    return (
      <div className="p-8 glass-card border border-white/10 rounded-3xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-xl w-1/4"></div>
          <div className="h-48 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const isVotingPhase = dispute.resolutionType === ResolutionType.PendingVote;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="p-8 glass-card border border-white/10 rounded-3xl">
        <h2 className="text-2xl font-bold text-white mb-6">Dispute #{dispute.disputeId}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Booking ID</p>
            <p className="text-xl font-bold text-white">{dispute.bookingId}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">Escrow ID</p>
            <p className="text-xl font-bold text-white">{dispute.escrowId}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-3">Reason</h3>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-gray-300">
            {dispute.reason}
          </div>
        </div>

        {isVotingPhase ? (
          <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-6">Submit Decision</h3>
            <div className="space-y-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={refundApproved}
                  onChange={(e) => setRefundApproved(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-200 group-hover:text-white transition-colors">Support refund request</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Refund Percentage (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={refundPercentage}
                  onChange={(e) => setRefundPercentage(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Justification <span className="text-red-400 text-xs">*Required</span>
                </label>
                <textarea
                  value={voteJustification}
                  onChange={(e) => setVoteJustification(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Explain the reasoning behind your decision..."
                />
              </div>

              <button
                onClick={handleVote}
                disabled={isPending || !voteJustification.trim()}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isPending ? 'Submitting Decision...' : 'Commit Decision'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-center">
            <p className="text-amber-200">This dispute is currently awaiting manual moderator review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
