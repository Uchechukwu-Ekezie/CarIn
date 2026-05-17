/**
 * Typed surface for the `car-registry` Clarity contract.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    stringAsciiCV,
    standardPrincipalCV,
    cvToValue,
    type ClarityValue,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapOptionalTuple } from "./codec";

export interface CarRecord {
    id: number;
    owner: string;
    plateNumber: string;
    make: string;
    model: string;
    year: number;
}

const REF = () => getContractRef("carRegistry");

export async function getCar(
    carId: number | bigint,
    senderAddress?: string,
): Promise<CarRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-car",
        functionArgs: [uintCV(BigInt(carId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;
    return {
        id: Number(carId),
        owner: String(tuple["owner"]),
        plateNumber: String(tuple["plate-number"]),
        make: String(tuple["make"]),
        model: String(tuple["model"]),
        year: Number(tuple["year"]),
    };
}

export async function getOwnerCarIds(
    ownerAddress: string,
    senderAddress?: string,
): Promise<number[]> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-owner-cars",
        functionArgs: [standardPrincipalCV(ownerAddress)],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    const ids = cvToValue(result as ClarityValue) as Array<bigint | number>;
    return (ids ?? []).map(Number);
}

export function buildRegisterCarCall(args: {
    plateNumber: string; // (string-ascii 20)
    make: string;        // (string-ascii 50)
    model: string;       // (string-ascii 50)
    year: number;
}) {
    return {
        ...REF(),
        functionName: "register-car",
        functionArgs: [
            stringAsciiCV(args.plateNumber),
            stringAsciiCV(args.make),
            stringAsciiCV(args.model),
            uintCV(BigInt(args.year)),
        ],
        network: getStacksNetwork(),
    };
}

export function buildUpdateCarCall(args: {
    carId: number | bigint;
    plateNumber: string;
    make: string;
    model: string;
    year: number;
}) {
    return {
        ...REF(),
        functionName: "update-car",
        functionArgs: [
            uintCV(BigInt(args.carId)),
            stringAsciiCV(args.plateNumber),
            stringAsciiCV(args.make),
            stringAsciiCV(args.model),
            uintCV(BigInt(args.year)),
        ],
        network: getStacksNetwork(),
    };
}
