/**
 * Search component for address/location search
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { geocodeAddress, GeocodeError } from '@/lib/utils/geocoding';
import { Coordinates } from '@/lib/utils/distance';

interface MapSearchProps {
  onLocationFound: (coordinates: Coordinates, address: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
}

export default function MapSearch({
  onLocationFound,
  onError,
  placeholder = 'Search for an address or location...',
}: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const result = await geocodeAddress(searchQuery);
      onLocationFound(result.coordinates, result.address);
      setQuery(result.address);
    } catch (error) {
      const err = error as GeocodeError;
      const message = err.message || 'Failed to find location';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [onLocationFound, onError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search queries
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length >= 3) {
      debounceTimer.current = setTimeout(() => {
        handleSearch(value);
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    handleSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-12 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all outline-none text-sm font-medium backdrop-blur-md"
          disabled={loading}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>
    </form>
  );
}




