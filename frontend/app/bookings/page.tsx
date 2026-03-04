"use client";

import { useStacksAuth } from "@/lib/providers/AppKitProvider";
import WalletConnect from "@/components/WalletConnect";
import BookingHistory from "@/components/booking/BookingHistory";

export default function BookingsPage() {
  const { isConnected, stxAddress: address } = useStacksAuth();

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-6xl mx-auto py-20">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">
              Booking History
            </h1>
            <p className="text-gray-400 text-lg">Securely view and manage all your past parking reservations.</p>
          </div>

          <div className="glass-card p-16 rounded-[3rem] border border-white/10 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white mb-4">Authentication Required</p>
            <p className="text-gray-400 mb-10 max-w-sm mx-auto">
              Please connect your Stacks wallet to verify your identity and retrieve your personal booking history.
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
          <h1 className="text-4xl font-bold text-white mb-2">Your Bookings</h1>
          <p className="text-gray-400">Manage your current and upcoming parking sessions.</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10">
          <BookingHistory userAddress={address!} />
        </div>
      </div>
    </main>
  );
}
