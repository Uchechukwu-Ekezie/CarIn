"use client";

import { useStacksAuth } from "@/lib/providers/AppKitProvider";
import WalletConnect from "@/components/WalletConnect";
import OwnerDashboard from "@/components/owner/OwnerDashboard";

export default function OwnerPage() {
  const { isConnected, stxAddress: address } = useStacksAuth();

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-6xl mx-auto py-20">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
              Owner Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Manage your smart properties and track your parking earnings.</p>
          </div>

          <div className="glass-card p-16 rounded-[3rem] border border-white/10 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white mb-4">Ownership Center</p>
            <p className="text-gray-400 mb-10 max-w-sm mx-auto">
              Port your parking spots to the Stacks ecosystem. Connect your wallet to access your owner-specific tools and metrics.
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-black">
      <div className="max-w-6xl mx-auto py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Portfolio Management</h1>
          <p className="text-gray-400">Overview of your listed parking spots and their performance.</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10">
          <OwnerDashboard address={address!} />
        </div>
      </div>
    </main>
  );
}
