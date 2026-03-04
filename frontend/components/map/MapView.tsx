/**
 * Main map view component integrating all features
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapContainer from './MapContainer';
import ParkingSpotMarker from './ParkingSpotMarker';
import MapSearch from './MapSearch';
import MapFilters, { FilterOptions } from './MapFilters';
import MapControls from './MapControls';
import { useParkingSpots } from '@/lib/hooks/useParkingSpots';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useSpotAvailability } from '@/lib/hooks/useSpotAvailability';
import { mapConfig } from '@/lib/config/map';
import { Coordinates, calculateDistance, isWithinRadius } from '@/lib/utils/distance';
import { ParkingSpot } from '@/lib/hooks/useParkingSpots';

// Dynamically import to avoid SSR issues
const DynamicMapContainer = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-400 font-medium lowercase tracking-widest text-xs">Initializing Grid...</p>
      </div>
    </div>
  ),
});

interface MapViewProps {
  onSpotClick?: (spot: ParkingSpot) => void;
}

export default function MapView({ onSpotClick }: MapViewProps) {
  const { spots, loading, error, refresh } = useParkingSpots();
  const { location: userLocation } = useGeolocation();
  const { getAvailability } = useSpotAvailability(spots);

  const [center, setCenter] = useState<Coordinates>(
    userLocation || mapConfig.defaultCenter
  );
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: 0,
    maxPrice: 10,
    showAvailableOnly: false,
    maxDistance: 50,
  });

  // Update center when user location is available
  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
    }
  }, [userLocation]);

  // Filter spots based on criteria
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      // Price filter
      const price = parseFloat(spot.pricePerHour);
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }

      // Availability filter
      if (filters.showAvailableOnly && !spot.isAvailable) {
        return false;
      }

      // Distance filter (if user location available)
      if (userLocation && spot.coordinates) {
        const distance = calculateDistance(userLocation, spot.coordinates);
        if (distance > filters.maxDistance) {
          return false;
        }
      }

      return true;
    });
  }, [spots, filters, userLocation]);


  const handleLocationFound = useCallback(
    (coordinates: Coordinates, address: string) => {
      setCenter(coordinates);
    },
    []
  );

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  if (loading && spots.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Syncing Bitcoin L2...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/10">
        <div className="text-center p-8 glass-card border-red-500/20">
          <p className="text-red-400 mb-6 font-medium">Node Error: {error}</p>
          <button
            onClick={refresh}
            className="btn-primary"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 z-[1000]">
        <MapSearch onLocationFound={handleLocationFound} />
      </div>

      {/* Filters */}
      <div className="absolute top-20 md:top-4 md:left-[340px] left-4 right-4 md:right-auto md:w-64 z-[1000]">
        <MapFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Map */}
      <div className="w-full h-full min-h-[500px] md:min-h-[600px]">
        <DynamicMapContainer center={center}>
          <MapControls onCenterChange={setCenter} />
          {filteredSpots
            .filter((spot) => spot.coordinates)
            .map((spot) => (
              <ParkingSpotMarker
                key={spot.id}
                spot={spot}
                onClick={onSpotClick}
              />
            ))}
        </DynamicMapContainer>
      </div>

      {/* Results Count */}
      <div className="absolute bottom-10 left-10 z-[1000] glass-card px-6 py-3 border-white/10">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          On-Chain: <span className="text-white">{filteredSpots.length} / {spots.length}</span>
        </p>
      </div>
    </div>
  );
}

