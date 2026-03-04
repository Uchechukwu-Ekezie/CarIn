/**
 * Filter component for parking spots (price, availability, distance)
 */

'use client';

import { useState } from 'react';

export interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  showAvailableOnly: boolean;
  maxDistance: number; // in km
}

interface MapFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  defaultFilters?: Partial<FilterOptions>;
}

export default function MapFilters({
  onFilterChange,
  defaultFilters,
}: MapFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: defaultFilters?.minPrice ?? 0,
    maxPrice: defaultFilters?.maxPrice ?? 10,
    showAvailableOnly: defaultFilters?.showAvailableOnly ?? false,
    maxDistance: defaultFilters?.maxDistance ?? 50,
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="glass-card p-4 border-white/10 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-bold text-white uppercase tracking-widest text-xs">Filter Settings</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-500`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6 pt-6 border-t border-white/5 animate-fade-in-up">
          {/* Price Range */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              Price Range (STX/hr)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.minPrice}
                onChange={(e) =>
                  updateFilter('minPrice', parseFloat(e.target.value) || 0)
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="Min"
              />
              <span className="text-gray-600">—</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={filters.maxPrice}
                onChange={(e) =>
                  updateFilter('maxPrice', parseFloat(e.target.value) || 10)
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group/label">
              <input
                type="checkbox"
                checked={filters.showAvailableOnly}
                onChange={(e) =>
                  updateFilter('showAvailableOnly', e.target.checked)
                }
                className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-400 group-hover/label:text-white transition-colors uppercase tracking-wider">
                Available Only
              </span>
            </label>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              Max Distance: {filters.maxDistance} km
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={filters.maxDistance}
              onChange={(e) =>
                updateFilter('maxDistance', parseInt(e.target.value))
              }
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
