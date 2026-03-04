/**
 * List view component for parking spots
 */

'use client';

import Link from 'next/link';
import { ParkingSpot } from '@/lib/hooks/useParkingSpots';
import { calculateDistance, formatDistance } from '@/lib/utils/distance';
import { Coordinates } from '@/lib/utils/distance';

interface SpotListProps {
  spots: ParkingSpot[];
  userLocation?: Coordinates | null;
  onSpotClick?: (spot: ParkingSpot) => void;
}

export default function SpotList({
  spots,
  userLocation,
  onSpotClick,
}: SpotListProps) {
  const sortedSpots = [...spots].sort((a, b) => {
    if (!userLocation || !a.coordinates || !b.coordinates) return 0;

    const distanceA = calculateDistance(userLocation, a.coordinates);
    const distanceB = calculateDistance(userLocation, b.coordinates);

    return distanceA - distanceB;
  });

  if (spots.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No parking spots found</p>
        <p className="text-sm text-gray-500 mt-2">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedSpots.map((spot) => {
        const distance = userLocation && spot.coordinates
          ? formatDistance(calculateDistance(userLocation, spot.coordinates))
          : null;

        return (
          <div
            key={spot.id}
            className="glass-card group p-6 hover:bg-white/10 transition-all cursor-pointer border-white/5 hover:border-white/10"
            onClick={() => onSpotClick?.(spot)}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Modern Image Container */}
              <div className="w-full md:w-48 h-32 bg-white/5 rounded-2xl overflow-hidden relative border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group-hover:opacity-100 opacity-50 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Spot Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-xl text-white tracking-tight leading-none mb-2">
                      {spot.location.split(',')[0]}
                    </h3>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                      Spot #{spot.id}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${spot.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                  >
                    {spot.isAvailable ? 'Available' : 'Reserved'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-2xl font-black text-white">
                        {spot.pricePerHour}
                      </span>
                      <span className="text-indigo-400 text-xs font-bold ml-1 uppercase">
                        STX/hr
                      </span>
                    </div>
                    {distance && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-xs font-medium">{distance}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/booking/${spot.id}`}
                    className="h-10 px-6 bg-white text-black text-xs font-bold rounded-xl hover:bg-indigo-500 hover:text-white transition-all flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}




