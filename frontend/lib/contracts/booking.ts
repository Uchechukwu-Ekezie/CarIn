/**
 * Typed surface for the `booking` Clarity contract.
 *
 * Mirrors parking-spot.ts: read-only calls are fully wired and
 * return plain JS; write calls return a request object for
 * @stacks/connect's openContractCall.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    cvToValue,
    type ClarityValue,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapOptionalTuple, microStxToStx } from "./codec";

export const BOOKING_STATUS = {
    ACTIVE: 0,
    CANCELLED: 1,
    COMPLETED: 2,
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export interface BookingRecord {
    id: number;
    spotId: number;
    user: string;
    carId: number;
    startTime: number;
    endTime: number;
    totalPriceMicroStx: bigint;
    totalPrice: string;
    checkInTime: number;
    checkOutTime: number;
    status: BookingStatus;
    escrowId: number;
}

const REF = () => getContractRef("booking");

export async function getBooking(
    bookingId: number | bigint,
    senderAddress?: string,
): Promise<BookingRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-booking",
        functionArgs: [uintCV(BigInt(bookingId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });

    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;

    const totalPriceMicroStx = BigInt(tuple["total-price"] as bigint);
    return {
        id: Number(bookingId),
        spotId: Number(tuple["spot-id"]),
        user: String(tuple["user"]),
        carId: Number(tuple["car-id"]),
        startTime: Number(tuple["start-time"]),
        endTime: Number(tuple["end-time"]),
        totalPriceMicroStx,
        totalPrice: microStxToStx(totalPriceMicroStx),
        checkInTime: Number(tuple["check-in-time"]),
        checkOutTime: Number(tuple["check-out-time"]),
        status: Number(tuple["status"]) as BookingStatus,
        escrowId: Number(tuple["escrow-id"]),
    };
}

/** Returns the list of booking ids associated with a spot. */
export async function getSpotBookings(
    spotId: number | bigint,
    senderAddress?: string,
): Promise<number[]> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-spot-bookings",
        functionArgs: [uintCV(BigInt(spotId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    // The contract returns a bare list (not wrapped in optional).
    const ids = cvToValue(result as ClarityValue) as Array<bigint | number>;
    return (ids ?? []).map(Number);
}

export function buildCreateBookingCall(args: {
    spotId: number | bigint;
    carId: number | bigint;
    startTime: number | bigint;
    endTime: number | bigint;
}) {
    return {
        ...REF(),
        functionName: "create-booking",
        functionArgs: [
            uintCV(BigInt(args.spotId)),
            uintCV(BigInt(args.carId)),
            uintCV(BigInt(args.startTime)),
            uintCV(BigInt(args.endTime)),
        ],
        network: getStacksNetwork(),
    };
}

export function buildCancelBookingCall(bookingId: number | bigint) {
    return {
        ...REF(),
        functionName: "cancel-booking",
        functionArgs: [uintCV(BigInt(bookingId))],
        network: getStacksNetwork(),
    };
}

export function buildCompleteBookingCall(bookingId: number | bigint) {
    return {
        ...REF(),
        functionName: "complete-booking",
        functionArgs: [uintCV(BigInt(bookingId))],
        network: getStacksNetwork(),
    };
}
