/**
 * Typed surface for the `user-registry` Clarity contract.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    boolCV,
    standardPrincipalCV,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapOptionalTuple } from "./codec";

export interface UserRecord {
    address: string;
    isVerified: boolean;
    totalBookings: number;
    /** Scaled by 10 (e.g. 45 = 4.5). */
    hostRatingScaledByTen: number;
    /** Decimal convenience. */
    hostRating: number;
    /** Scaled by 10. */
    renterRatingScaledByTen: number;
    renterRating: number;
    totalHostReviews: number;
    totalRenterReviews: number;
}

const REF = () => getContractRef("userRegistry");

export async function getUser(
    address: string,
    senderAddress?: string,
): Promise<UserRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-user",
        functionArgs: [standardPrincipalCV(address)],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;
    const hostScaled = Number(tuple["host-rating"]);
    const renterScaled = Number(tuple["renter-rating"]);
    return {
        address,
        isVerified: Boolean(tuple["is-verified"]),
        totalBookings: Number(tuple["total-bookings"]),
        hostRatingScaledByTen: hostScaled,
        hostRating: hostScaled / 10,
        renterRatingScaledByTen: renterScaled,
        renterRating: renterScaled / 10,
        totalHostReviews: Number(tuple["total-host-reviews"]),
        totalRenterReviews: Number(tuple["total-renter-reviews"]),
    };
}

export async function isUserVerified(
    address: string,
    senderAddress?: string,
): Promise<boolean> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "is-user-verified",
        functionArgs: [standardPrincipalCV(address)],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    // is-user-verified returns a bare bool, not optional.
    return result.type === "true";
}

export function buildRegisterUserCall() {
    return {
        ...REF(),
        functionName: "register-user",
        functionArgs: [],
        network: getStacksNetwork(),
    };
}

export function buildVerifyUserCall(address: string) {
    return {
        ...REF(),
        functionName: "verify-user",
        functionArgs: [standardPrincipalCV(address)],
        network: getStacksNetwork(),
    };
}

export function buildUpdateRatingCall(args: {
    userAddress: string;
    isHost: boolean;
    newRating: number; // 1..5
}) {
    return {
        ...REF(),
        functionName: "update-rating",
        functionArgs: [
            standardPrincipalCV(args.userAddress),
            boolCV(args.isHost),
            uintCV(BigInt(args.newRating)),
        ],
        network: getStacksNetwork(),
    };
}
