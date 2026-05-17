/**
 * Hook to fetch and cache parking spots from the on-chain
 * parking-spot contract for map display.
 *
 * The Clarity contract doesn't expose a "list all spots" function,
 * so we discover spots by walking ids from 1 until we hit a gap.
 * This is reasonable for a few hundred listings; if the catalogue
 * ever gets larger we'll need an off-chain indexer.
 */

import { useState, useEffect, useCallback } from "react";

import { getSpot, type ParkingSpotRecord } from "@/lib/contracts/parkingSpot";

export interface ParkingSpot {
    id: number;
    location: string;
    coordinates?: { lat: number; lng: number };
    pricePerHour: string;
    isAvailable: boolean;
    owner: string;
    images: string[];
    description?: string;
    totalBookings?: number;
}

interface UseParkingSpotsState {
    spots: ParkingSpot[];
    loading: boolean;
    error: string | null;
    lastFetch: number | null;
}

const CACHE_DURATION = 30_000; // 30s
const MAX_SCAN = 200; // safety cap on the sequential walk
const GAP_LIMIT = 5;  // stop after this many consecutive misses

function toUiSpot(record: ParkingSpotRecord): ParkingSpot {
    return {
        id: record.id,
        location: record.location,
        // FIXME: location → coordinates needs a geocoding step. Until
        // MapPicker writes lat/lng on chain (or we add an off-chain
        // index), the map falls back to listing-only rendering.
        coordinates: undefined,
        pricePerHour: record.pricePerHour,
        isAvailable: record.isAvailable,
        owner: record.owner,
        images: [],
        description: undefined,
        totalBookings: undefined,
    };
}

async function discoverSpots(): Promise<ParkingSpot[]> {
    const spots: ParkingSpot[] = [];
    let consecutiveMisses = 0;

    for (let id = 1; id <= MAX_SCAN; id++) {
        const record = await getSpot(id);
        if (record) {
            spots.push(toUiSpot(record));
            consecutiveMisses = 0;
        } else if (++consecutiveMisses >= GAP_LIMIT) {
            break;
        }
    }
    return spots;
}

export function useParkingSpots() {
    const [state, setState] = useState<UseParkingSpotsState>({
        spots: [],
        loading: false,
        error: null,
        lastFetch: null,
    });

    const fetchSpots = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const spots = await discoverSpots();
            setState({ spots, loading: false, error: null, lastFetch: Date.now() });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to fetch parking spots";
            setState((prev) => ({ ...prev, loading: false, error: message }));
        }
    }, []);

    const refreshSpots = useCallback(() => {
        fetchSpots();
    }, [fetchSpots]);

    useEffect(() => {
        fetchSpots();
    }, [fetchSpots]);

    const shouldRefresh = useCallback(() => {
        if (!state.lastFetch) return true;
        return Date.now() - state.lastFetch > CACHE_DURATION;
    }, [state.lastFetch]);

    useEffect(() => {
        if (shouldRefresh() && !state.loading) {
            const interval = setInterval(() => {
                if (shouldRefresh()) fetchSpots();
            }, CACHE_DURATION);
            return () => clearInterval(interval);
        }
    }, [shouldRefresh, state.loading, fetchSpots]);

    return {
        spots: state.spots,
        loading: state.loading,
        error: state.error,
        refresh: refreshSpots,
    };
}
