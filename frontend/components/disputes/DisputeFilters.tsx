'use client';

import { useState } from 'react';
import { ResolutionType } from '@/lib/contracts/disputeResolution';

interface DisputeFiltersProps {
  onFilterChange: (filters: DisputeFilters) => void;
}

export interface DisputeFilters {
  status: 'all' | 'active' | 'resolved';
  resolutionType: ResolutionType | 'all';
  refundStatus: 'all' | 'approved' | 'denied';
}

export default function DisputeFiltersComponent({ onFilterChange }: DisputeFiltersProps) {
  const [filters, setFilters] = useState<DisputeFilters>({
    status: 'all',
    resolutionType: 'all',
    refundStatus: 'all'
  });

  const updateFilter = <K extends keyof DisputeFilters>(key: K, value: DisputeFilters[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="p-8 glass-card border border-white/10 rounded-[2.5rem] sticky top-24">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">System filtering</h3>

      <div className="space-y-8">
        <div>
          <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-1">
            Life Cycle
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value as DisputeFilters['status'])}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-[#0A0A0A]">All Phases</option>
            <option value="active" className="bg-[#0A0A0A]">Active Cases</option>
            <option value="resolved" className="bg-[#0A0A0A]">Resolved Archive</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-1">
            Internal Protocol
          </label>
          <select
            value={filters.resolutionType}
            onChange={(e) => updateFilter('resolutionType', e.target.value === 'all' ? 'all' : Number(e.target.value) as ResolutionType)}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-[#0A0A0A]">All Protocols</option>
            <option value={ResolutionType.Automated} className="bg-[#0A0A0A]">Automated Scan</option>
            <option value={ResolutionType.PendingVote} className="bg-[#0A0A0A]">Community Voting</option>
            <option value={ResolutionType.Manual} className="bg-[#0A0A0A]">Human Review</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-1">
            Outcome Status
          </label>
          <select
            value={filters.refundStatus}
            onChange={(e) => updateFilter('refundStatus', e.target.value as DisputeFilters['refundStatus'])}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-[#0A0A0A]">All Outcomes</option>
            <option value="approved" className="bg-[#0A0A0A]">Refund Approved</option>
            <option value="denied" className="bg-[#0A0A0A]">Refund Denied</option>
          </select>
        </div>

        <button
          onClick={() => {
            const resetFilters: DisputeFilters = {
              status: 'all',
              resolutionType: 'all',
              refundStatus: 'all'
            };
            setFilters(resetFilters);
            onFilterChange(resetFilters);
          }}
          className="w-full px-6 py-4 bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-95 border border-white/5"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
