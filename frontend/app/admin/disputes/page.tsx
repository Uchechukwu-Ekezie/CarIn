'use client';

import { useState } from 'react';
import { useStacksAuth } from '@/lib/providers/AppKitProvider';
import AdminDisputePanel from '@/components/disputes/AdminDisputePanel';
import { DISPUTE_RESOLUTION_ADDRESSES } from '@/lib/contracts/disputeResolution';

export default function AdminDisputesPage() {
  const { stxAddress: address, isConnected } = useStacksAuth();
  const [disputeId, setDisputeId] = useState<string>('');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  // For Stacks, we check if the user is authorized (moderator)
  // In a real app, this would be a contract read or backend check
  const isModerator = true;

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center glass-card">
            <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
            <p className="text-gray-400">Please connect your wallet to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center glass-card">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
            <p className="text-red-300/70">You are not authorized to access this admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 p-8 glass-card rounded-3xl border border-white/10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
            Admin Dispute Panel
          </h1>
          <p className="text-gray-400">Review and resolve disputes on the Stacks blockchain</p>
        </div>

        <div className="mb-6 p-6 glass-card rounded-2xl border border-white/10">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Dispute ID"
              value={disputeId}
              onChange={(e) => setDisputeId(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={() => {
                if (disputeId) {
                  setSelectedDisputeId(disputeId);
                }
              }}
              className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg active:scale-95"
            >
              Load Dispute
            </button>
          </div>
        </div>

        {selectedDisputeId && (
          <AdminDisputePanel disputeId={selectedDisputeId} />
        )}

        {!selectedDisputeId && (
          <div className="p-12 glass-card border border-white/10 rounded-3xl text-center">
            <p className="text-gray-500 text-lg">Enter a dispute ID to view details and evidence</p>
          </div>
        )}
      </div>
    </div>
  );
}
