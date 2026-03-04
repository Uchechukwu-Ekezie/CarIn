"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useStacksAuth } from "@/lib/providers/AppKitProvider";
import BookingFlow from "@/components/booking/BookingFlow";
import SpotDetails from "@/components/booking/SpotDetails";
import { BookingLoading } from "@/components/booking/LoadingStates";
import { BookingErrorBoundary } from "@/components/booking/BookingErrorBoundary";

export default function BookingPage() {
  const params = useParams();
  const spotId = params.spotId as string;
  const { stxAddress: address, isConnected } = useStacksAuth();
  const [spot, setSpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpotDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation for Stacks migration
      const mockSpot = {
        id: spotId,
        location: "123 Main St, San Francisco, CA",
        pricePerHour: "2.50",
        images: ["QmExample1", "QmExample2"],
        description: "Convenient street parking near downtown",
        owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        isAvailable: true,
      };

      // Simulate fetch delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setSpot(mockSpot);
    } catch (err: any) {
      console.error("Error fetching spot:", err);
      setError("Failed to load parking spot details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  useEffect(() => {
    fetchSpotDetails();
  }, [fetchSpotDetails]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-4xl mx-auto py-20">
          <BookingLoading />
        </div>
      </main>
    );
  }

  if (error || !spot) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-4xl mx-auto py-20">
          <div className="glass-card p-12 rounded-[2.5rem] border border-white/10 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Notice</h2>
            <p className="text-gray-400">{error || "Spot not found"}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-4xl mx-auto py-12">
          <div className="mb-8">
            <SpotDetails spot={spot} />
          </div>
          <div className="glass-card p-12 rounded-[3rem] border border-white/10 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-white mb-2">Protected Booking</p>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Please connect your Stacks wallet to securely finalize your parking reservation.
            </p>
            <div className="flex justify-center">
              {/* WalletConnect button would be here or managed via Header */}
              <p className="text-sm text-indigo-400 font-medium">Use the connect button in the header</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <BookingErrorBoundary>
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-4xl mx-auto py-12">
          <SpotDetails spot={spot} />
          <div className="mt-12">
            <BookingFlow spot={spot} userAddress={address!} />
          </div>
        </div>
      </main>
    </BookingErrorBoundary>
  );
}
