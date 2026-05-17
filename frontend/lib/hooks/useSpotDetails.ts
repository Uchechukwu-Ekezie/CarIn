import { useState, useEffect, useCallback } from "react";

import { getSpot } from "@/lib/contracts/parkingSpot";
import { getSpotRating } from "@/lib/contracts/spotReviews";

interface SpotDetails {
    id: string;
    location: string;
    pricePerHour: string;
    images: string[];
    description: string;
    owner: string;
    isAvailable: boolean;
    totalBookings: number;
    rating?: number;
}

function parseSpotId(spotId: string): number | null {
    const n = Number(spotId);
    return Number.isFinite(n) && Number.isInteger(n) && n > 0 ? n : null;
}

export function useSpotDetails(spotId: string) {
    const [spot, setSpot] = useState<SpotDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSpotDetails = useCallback(async () => {
        if (!spotId) return;
        const id = parseSpotId(spotId);
        if (id === null) {
            setError(`invalid spot id: ${spotId}`);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [record, rating] = await Promise.all([
                getSpot(id),
                // get-spot-rating returns null for spots with no reviews — that's fine.
                getSpotRating(id).catch(() => null),
            ]);

            if (!record) {
                setSpot(null);
                setError(`spot ${spotId} not found`);
                return;
            }

            setSpot({
                id: spotId,
                location: record.location,
                pricePerHour: record.pricePerHour,
                // FIXME: images and description aren't part of the on-chain
                // record — they should come from an IPFS CID stored alongside
                // the spot. See PR 5 for the upload flow.
                images: [],
                description: "",
                owner: record.owner,
                isAvailable: record.isAvailable,
                // FIXME: total bookings isn't a read on parking-spot. We can
                // derive it by getting the booking ids from
                // booking.get-spot-bookings and counting, but skipping for
                // now to keep this hook's blast radius small.
                totalBookings: 0,
                rating: rating?.average,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to fetch spot details");
        } finally {
            setLoading(false);
        }
    }, [spotId]);

    useEffect(() => {
        fetchSpotDetails();
    }, [fetchSpotDetails]);

    return {
        spot,
        loading,
        error,
        refresh: fetchSpotDetails,
    };
}
