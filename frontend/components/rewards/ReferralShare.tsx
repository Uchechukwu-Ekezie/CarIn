"use client";

import { useState } from "react";
import { useReferrals } from "@/lib/hooks/useRewards";
import { useStacksAuth } from "@/lib/providers/AppKitProvider";

interface ReferralShareProps {
  spotId: string;
}

export default function ReferralShare({ spotId }: ReferralShareProps) {
  const { stxAddress: address, isConnected } = useStacksAuth();
  const { createReferral, loading } = useReferrals();
  const [refereeAddress, setRefereeAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (!refereeAddress.trim()) {
      setError("Please enter a referee address");
      return;
    }

    // Stacks address validation (basic)
    if (!/^[S][P|T][0-9A-Z]{28,40}$/.test(refereeAddress)) {
      setError("Invalid Stacks address format");
      return;
    }

    if (refereeAddress === address) {
      setError("Cannot refer yourself");
      return;
    }

    try {
      setError(null);
      await createReferral(refereeAddress, spotId);
      setSuccess(true);
      setRefereeAddress("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to create referral");
    }
  };

  const generateReferralLink = () => {
    if (!address) return "";
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/booking/${spotId}?ref=${address}`;
  };

  const copyReferralLink = () => {
    const link = generateReferralLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    alert("Referral link copied to clipboard!");
  };

  if (!isConnected) {
    return (
      <div className="p-8 glass-card border border-white/10 rounded-[2rem] text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to start earning referral rewards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="px-2">
        <h3 className="text-2xl font-bold text-white mb-2">Network Expansion</h3>
        <p className="text-gray-400 text-sm">
          Grow the CarIn ecosystem. Earn <span className="text-indigo-400 font-bold">25 STX</span> for every successful booking referred.
        </p>
      </div>

      {/* Referral Link */}
      <div className="p-8 glass-card border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
          <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>

        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">
          Your unique access link
        </label>
        <div className="flex gap-3 relative z-10">
          <input
            type="text"
            value={generateReferralLink()}
            readOnly
            className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-xs focus:outline-none"
          />
          <button
            onClick={copyReferralLink}
            className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            Copy
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-500 font-medium px-1">
          Recipients using this link will automatically credit you upon booking confirmation.
        </p>
      </div>

      {/* Manual Referral Form */}
      <form onSubmit={handleCreateReferral} className="p-8 glass-card border border-white/10 rounded-[2.5rem] space-y-6">
        <div>
          <label htmlFor="refereeAddress" className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-1">
            Direct Node Designation
          </label>
          <input
            type="text"
            id="refereeAddress"
            value={refereeAddress}
            onChange={(e) => setRefereeAddress(e.target.value)}
            placeholder="Enter Stacks Address (SP...)"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fade-in">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Protocol designation successful!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          {loading ? "PROCESSING..." : "REGISTER REFERRAL"}
        </button>
      </form>
    </div>
  );
}
