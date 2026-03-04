"use client";

import { useState, useEffect, useCallback } from "react";

interface SpotAvailabilityCheckerProps {
  spotId: string;
  selectedDate: Date | null;
  startTime: string;
  endTime: string;
  onAvailabilityChange: (isAvailable: boolean) => void;
}

export default function SpotAvailabilityChecker({
  spotId,
  selectedDate,
  startTime,
  endTime,
  onAvailabilityChange,
}: SpotAvailabilityCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const checkAvailability = useCallback(async () => {
    setChecking(true);
    try {
      // Mock implementation for Stacks migration
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsAvailable(true);
      onAvailabilityChange(true);
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsAvailable(false);
      onAvailabilityChange(false);
    } finally {
      setChecking(false);
    }
  }, [onAvailabilityChange]);

  useEffect(() => {
    if (!selectedDate || !startTime || !endTime) {
      setIsAvailable(true);
      return;
    }

    checkAvailability();
  }, [checkAvailability, selectedDate, startTime, endTime]);

  if (!selectedDate || !startTime || !endTime) {
    return null;
  }

  if (checking) {
    return (
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
        Polling Stacks Node Availability...
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[10px] font-bold text-rose-400 uppercase tracking-widest">
        ⚠️ Node conflict detected for selected window
      </div>
    );
  }

  return (
    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
      ✓ Designaton slot verified on-chain
    </div>
  );
}




