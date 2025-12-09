/**
 * Main map view component integrating all features
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import MapContainer from './MapContainer';
import ParkingSpotMarker from './ParkingSpotMarker';
import MarkerCluster from './MarkerCluster';
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
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
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
  useState(() => {
    if (userLocation) {
      setCenter(userLocation);
    }
  });

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

  // Prepare markers for clustering
  const clusterMarkers = useMemo(() => {
    return filteredSpots
      .filter((spot) => spot.coordinates)
      .map((spot) => ({
        position: [spot.coordinates!.lat, spot.coordinates!.lng] as [number, number],
        popup: (
          <div className="spot-popup">
            <ParkingSpotMarker spot={spot} onClick={onSpotClick} />
          </div>
        ),
        onClick: () => onSpotClick?.(spot),
      }));
  }, [filteredSpots, onSpotClick]);

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
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parking spots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <p className="text-red-600 mb-4">Error loading spots: {error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-[1000] w-80">
        <MapSearch onLocationFound={handleLocationFound} />
      </div>

      {/* Filters */}
      <div className="absolute top-4 left-[340px] z-[1000] w-64">
        <MapFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Map */}
      <div className="w-full h-full">
        <DynamicMapContainer center={center}>
          <MapControls onCenterChange={setCenter} />
          <MarkerCluster markers={clusterMarkers} />
        </DynamicMapContainer>
      </div>

      {/* Results Count */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredSpots.length}</span>{' '}
          of <span className="font-semibold">{spots.length}</span> spots
        </p>
      </div>
    </div>
  );
}

