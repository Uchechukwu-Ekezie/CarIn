"use client";

import { useState } from "react";
import { useRewardReports } from "@/lib/hooks/useRewards";
import { useStacksAuth } from "@/lib/providers/AppKitProvider";

interface ReportFormProps {
  spotId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReportForm({ spotId, onSuccess, onCancel }: ReportFormProps) {
  const { isConnected } = useStacksAuth();
  const { submitReport, loading } = useRewardReports();
  const [reason, setReason] = useState("");
  const [evidenceHash, setEvidenceHash] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for the report");
      return;
    }

    if (!evidenceHash.trim()) {
      setError("Please provide evidence (IPFS hash or URL)");
      return;
    }

    try {
      setError(null);
      await submitReport(spotId, reason, evidenceHash);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    }
  };

  if (!isConnected) {
    return (
      <div className="p-10 glass-card border border-white/10 rounded-[2.5rem] text-center">
        <p className="text-gray-400">Please connect your Stacks wallet to submit a report and earn rewards.</p>
      </div>
    );
  }

  return (
    <div className="glass-card border border-white/10 rounded-[3rem] overflow-hidden animate-fade-in-up">
      <div className="p-10 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Security Intelligence</h2>
        <p className="text-gray-500 italic">Integrity audit for Parking Node #{spotId}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div>
          <label htmlFor="reason" className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">
            Inaccuracy Description *
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={4}
            placeholder="Identify the discrepancy (location mismatch, non-existent spot, fraudulent listing...)"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
          />
        </div>

        <div>
          <label htmlFor="evidenceHash" className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">
            Evidence URI/Hash *
          </label>
          <input
            type="text"
            id="evidenceHash"
            value={evidenceHash}
            onChange={(e) => setEvidenceHash(e.target.value)}
            required
            placeholder="ipfs://Qm... or https://..."
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
          <p className="mt-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest px-1">
            Verifiable off-chain data source required for audit validation
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-400 text-xs font-bold tracking-widest uppercase">{error}</p>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            {loading ? "TRANSMITTING..." : "SUBMIT INTEL"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-8 py-4 bg-white/5 text-gray-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              ABORT
            </button>
          )}
        </div>

        <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
          <p className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-[0.15em] leading-relaxed">
            Successful validation releases <span className="text-white">300 STX</span> intelligence rewards to your designations.
          </p>
        </div>
      </form>
    </div>
  );
}
