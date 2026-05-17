/**
 * Typed surface for the `spot-reviews` Clarity contract.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    stringUtf8CV,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapOptionalTuple } from "./codec";

export interface ReviewRecord {
    id: number;
    bookingId: number;
    reviewer: string;
    spotId: number;
    rating: number;
    comment: string;
}

export interface SpotRatingRecord {
    spotId: number;
    totalRating: number;
    reviewCount: number;
    /** Average × 10 (e.g. 45 = 4.5). The Clarity contract scales by 10. */
    averageScaledByTen: number;
    /** Convenience: the average as a normal decimal (e.g. 4.5). */
    average: number;
}

const REF = () => getContractRef("spotReviews");

export async function getReview(
    reviewId: number | bigint,
    senderAddress?: string,
): Promise<ReviewRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-review",
        functionArgs: [uintCV(BigInt(reviewId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;
    return {
        id: Number(reviewId),
        bookingId: Number(tuple["booking-id"]),
        reviewer: String(tuple["reviewer"]),
        spotId: Number(tuple["spot-id"]),
        rating: Number(tuple["rating"]),
        comment: String(tuple["comment"]),
    };
}

export async function getSpotRating(
    spotId: number | bigint,
    senderAddress?: string,
): Promise<SpotRatingRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-spot-rating",
        functionArgs: [uintCV(BigInt(spotId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;
    const scaled = Number(tuple["average"]);
    return {
        spotId: Number(spotId),
        totalRating: Number(tuple["total-rating"]),
        reviewCount: Number(tuple["review-count"]),
        averageScaledByTen: scaled,
        average: scaled / 10,
    };
}

export function buildSubmitReviewCall(args: {
    bookingId: number | bigint;
    spotId: number | bigint;
    rating: number; // 1..5, enforced on chain
    comment: string;
}) {
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
        throw new Error(`rating must be an integer 1..5, got ${args.rating}`);
    }
    return {
        ...REF(),
        functionName: "submit-review",
        functionArgs: [
            uintCV(BigInt(args.bookingId)),
            uintCV(BigInt(args.spotId)),
            uintCV(BigInt(args.rating)),
            stringUtf8CV(args.comment),
        ],
        network: getStacksNetwork(),
    };
}
