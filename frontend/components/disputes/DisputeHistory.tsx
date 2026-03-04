'use client';

import { useState, useEffect } from 'react';
import { useStacksAuth } from '@/lib/providers/AppKitProvider';
import DisputeCard from './DisputeCard';
import { DisputeDetails } from '@/lib/contracts/disputeResolution';

interface DisputeHistoryProps {
  escrowIds?: string[];
}

export default function DisputeHistory({ escrowIds }: DisputeHistoryProps) {
  const { isConnected } = useStacksAuth();
  const [disputes, setDisputes] = useState<DisputeDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputeDetails | null>(null);

  useEffect(() => {
    const loadDisputes = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Mock data for Stacks migration
        const mockDisputes: DisputeDetails[] = [
          {
            disputeId: "DISP-101",
            escrowId: "ESC-505",
            bookingId: "BOOK-707",
            filedBy: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            opposingParty: "ST3NYPQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
            reason: "The parking spot was occupied by another vehicle upon arrival.",
            primaryEvidenceHash: "0x123...456",
            isResolved: false,
            refundApproved: false,
            resolutionType: 0,
            refundPercentage: 0,
            filedAt: Date.now() - 86400000,
            resolvedAt: 0,
            resolvedBy: ""
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 800));
        setDisputes(mockDisputes);
      } catch (error) {
        console.error('Error loading disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, [isConnected]);

  if (loading) {
    return (
      <div className="p-8 glass-card rounded-[2.5rem] border border-white/10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded-xl w-1/3"></div>
          <div className="space-y-4">
            <div className="h-40 bg-white/5 rounded-3xl"></div>
            <div className="h-40 bg-white/5 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeDisputes = disputes.filter((d) => !d.isResolved);
  const resolvedDisputes = disputes.filter((d) => d.isResolved);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dispute Center</h2>
          <p className="text-gray-500 font-medium">Tracking {disputes.length} active investigations</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-bold uppercase tracking-widest">
            {activeDisputes.length} Active
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold uppercase tracking-widest">
            {resolvedDisputes.length} Resolved
          </div>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="p-20 glass-card border border-white/10 rounded-[3rem] text-center animate-fade-in">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mb-2">Clear Record</p>
          <p className="text-gray-500 max-w-sm mx-auto">No disputes found for your account. All your interactions are currently in good standing.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeDisputes.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] px-2">Active Cases</h3>
              <div className="grid gap-6">
                {activeDisputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.disputeId}
                    dispute={dispute}
                    onClick={() => setSelectedDispute(dispute)}
                  />
                ))}
              </div>
            </div>
          )}

          {resolvedDisputes.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] px-2">Archive</h3>
              <div className="grid gap-6">
                {resolvedDisputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.disputeId}
                    dispute={dispute}
                    onClick={() => setSelectedDispute(dispute)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedDispute && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-fade-in">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative">
            <button
              onClick={() => setSelectedDispute(null)}
              className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-10">
              <h3 className="text-3xl font-black text-white mb-2">Case Investigation</h3>
              <p className="text-gray-500">Detailed overview of dispute #{selectedDispute.disputeId}</p>
            </div>

            <DisputeCard dispute={selectedDispute} />

            <div className="mt-10 p-8 bg-white/5 border border-white/5 rounded-[2rem]">
              <h4 className="text-lg font-bold text-white mb-4">Evidence Log</h4>
              <p className="text-gray-500 text-sm">Security auditing and decentralized evidence retrieval in progress...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
