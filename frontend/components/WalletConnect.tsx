"use client";

import { useStacksAuth } from "@/lib/providers/AppKitProvider";

export default function WalletConnect() {
  const { isConnected, stxAddress, connectWallet, logout } = useStacksAuth();

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
          {stxAddress?.slice(0, 6)}...{stxAddress?.slice(-4)}
        </span>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Connect wallet
    </button>
  );
}




