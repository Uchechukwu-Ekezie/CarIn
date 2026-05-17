/**
 * Typed surface for the `parking-spot` Clarity contract.
 *
 * Read-only calls (get-spot, get-spot-owner) are fully wired and
 * return plain JS objects. Write calls (list-spot,
 * update-spot-availability) return a request descriptor that the
 * caller passes into @stacks/connect's `openContractCall` (the
 * wallet is what actually signs and broadcasts, so this module
 * never imports @stacks/connect directly).
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    stringUtf8CV,
    boolCV,
    standardPrincipalCV,
    type ClarityValue,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapOptionalTuple, microStxToStx } from "./codec";

export interface ParkingSpotRecord {
    id: number;
    owner: string;
    location: string;
    pricePerHourMicroStx: bigint;
    pricePerHour: string; // human-readable STX, e.g. "2.5"
    isAvailable: boolean;
    createdAtBurnHeight: number;
}

const REF = () => getContractRef("parkingSpot");

/** Returns null if the spot does not exist. */
export async function getSpot(
    spotId: number | bigint,
    senderAddress?: string,
): Promise<ParkingSpotRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-spot",
        functionArgs: [uintCV(BigInt(spotId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });

    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;

    const microStx = BigInt(tuple["price-per-hour"] as bigint);
    return {
        id: Number(spotId),
        owner: String(tuple["owner"]),
        location: String(tuple["location"]),
        pricePerHourMicroStx: microStx,
        pricePerHour: microStxToStx(microStx),
        isAvailable: Boolean(tuple["is-available"]),
        createdAtBurnHeight: Number(tuple["created-at"]),
    };
}

/** Returns null if the spot does not exist. */
export async function getSpotOwner(
    spotId: number | bigint,
    senderAddress?: string,
): Promise<string | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-spot-owner",
        functionArgs: [uintCV(BigInt(spotId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });

    if (result.type === "some") {
        return String((result as { value: ClarityValue }).value);
    }
    return null;
}

/**
 * Build a `list-spot` contract-call request. Pass this into
 * `openContractCall` from @stacks/connect.
 *
 *     openContractCall({ ...buildListSpotCall({ ... }), onFinish, onCancel })
 */
export function buildListSpotCall(args: {
    location: string;
    pricePerHourMicroStx: bigint | number | string;
}) {
    return {
        ...REF(),
        functionName: "list-spot",
        functionArgs: [
            stringUtf8CV(args.location),
            uintCV(BigInt(args.pricePerHourMicroStx)),
        ],
        network: getStacksNetwork(),
    };
}

/** Build an `update-spot-availability` contract-call request. */
export function buildUpdateAvailabilityCall(args: {
    spotId: number | bigint;
    isAvailable: boolean;
}) {
    return {
        ...REF(),
        functionName: "update-spot-availability",
        functionArgs: [uintCV(BigInt(args.spotId)), boolCV(args.isAvailable)],
        network: getStacksNetwork(),
    };
}

// Re-export the principal helper so call sites that need to pass a
// principal as a function arg don't have to import @stacks/transactions.
export { standardPrincipalCV };
