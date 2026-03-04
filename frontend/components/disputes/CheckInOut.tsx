'use client';

import { useState } from 'react';
import { useStacksAuth } from '@/lib/providers/AppKitProvider';
import { useDisputeResolution, useCheckInData } from '@/lib/hooks/useDisputeResolution';

interface CheckInOutProps {
  bookingId: string;
  isOwner?: boolean;
}

export default function CheckInOut({ bookingId, isOwner = false }: CheckInOutProps) {
  const { stxAddress: address } = useStacksAuth();
  const { recordCheckIn, recordCheckOut, isPending } = useDisputeResolution();
  const { checkInData, isLoading } = useCheckInData(bookingId);
  const [action, setAction] = useState<'checkin' | 'checkout' | null>(null);

  const handleCheckIn = async () => {
    if (!address) return;
    setAction('checkin');
    try {
      await recordCheckIn(bookingId);
    } catch (error) {
      console.error('Check-in error:', error);
      setAction(null);
    }
  };

  const handleCheckOut = async () => {
    if (!address) return;
    setAction('checkout');
    try {
      await recordCheckOut(bookingId);
    } catch (error) {
      console.error('Check-out error:', error);
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 glass-card rounded-2xl border border-white/10">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
          <div className="h-10 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 glass-card border border-white/10 rounded-3xl group">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></span>
        {isOwner ? 'Recording Terminal' : 'Booking Status'}
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group-hover:bg-white/[0.08] transition-colors">
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">Check-in</p>
            {checkInData?.checkedIn ? (
              <p className="text-sm text-white">
                Recorded {new Date(checkInData.checkInTime).toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Awaiting check-in</p>
            )}
          </div>
          {isOwner && !checkInData?.checkedIn && (
            <button
              onClick={handleCheckIn}
              disabled={action === 'checkin' || isPending}
              className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {action === 'checkin' || isPending ? 'RECORDING...' : 'RECORD'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group-hover:bg-white/[0.08] transition-colors">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Check-out</p>
            {checkInData?.checkedOut ? (
              <p className="text-sm text-white">
                Recorded {new Date(checkInData.checkOutTime).toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {checkInData?.checkedIn ? 'Awaiting check-out' : 'Check-in required'}
              </p>
            )}
          </div>
          {isOwner && checkInData?.checkedIn && !checkInData?.checkedOut && (
            <button
              onClick={handleCheckOut}
              disabled={action === 'checkout' || isPending}
              className="px-6 py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {action === 'checkout' || isPending ? 'RECORDING...' : 'RECORD'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
