/**
 * Typed surface for the `payment-escrow` Clarity contract.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    boolCV,
    standardPrincipalCV,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapOptionalTuple, microStxToStx } from "./codec";

export const ESCROW_STATUS = {
    PENDING: 0,
    RELEASED: 1,
    REFUNDED: 2,
    DISPUTED: 3,
} as const;

export type EscrowStatus = (typeof ESCROW_STATUS)[keyof typeof ESCROW_STATUS];

export interface EscrowRecord {
    id: number;
    bookingId: number;
    payer: string;
    payee: string;
    amountMicroStx: bigint;
    amount: string;
    releaseTime: number;
    status: EscrowStatus;
}

const REF = () => getContractRef("paymentEscrow");

export async function getEscrow(
    escrowId: number | bigint,
    senderAddress?: string,
): Promise<EscrowRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-escrow",
        functionArgs: [uintCV(BigInt(escrowId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });

    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;

    const amount = BigInt(tuple["amount"] as bigint);
    return {
        id: Number(escrowId),
        bookingId: Number(tuple["booking-id"]),
        payer: String(tuple["payer"]),
        payee: String(tuple["payee"]),
        amountMicroStx: amount,
        amount: microStxToStx(amount),
        releaseTime: Number(tuple["release-time"]),
        status: Number(tuple["status"]) as EscrowStatus,
    };
}

export function buildCreateEscrowCall(args: {
    bookingId: number | bigint;
    payeeAddress: string;
    amountMicroStx: bigint | number | string;
    releaseTime: number | bigint;
}) {
    return {
        ...REF(),
        functionName: "create-escrow",
        functionArgs: [
            uintCV(BigInt(args.bookingId)),
            standardPrincipalCV(args.payeeAddress),
            uintCV(BigInt(args.amountMicroStx)),
            uintCV(BigInt(args.releaseTime)),
        ],
        network: getStacksNetwork(),
    };
}

export function buildReleaseFundsCall(escrowId: number | bigint) {
    return {
        ...REF(),
        functionName: "release-funds",
        functionArgs: [uintCV(BigInt(escrowId))],
        network: getStacksNetwork(),
    };
}

export function buildRefundPayerCall(escrowId: number | bigint) {
    return {
        ...REF(),
        functionName: "refund-payer",
        functionArgs: [uintCV(BigInt(escrowId))],
        network: getStacksNetwork(),
    };
}

export function buildResolveDisputeCall(args: {
    escrowId: number | bigint;
    refundPayer: boolean;
}) {
    return {
        ...REF(),
        functionName: "resolve-dispute",
        functionArgs: [uintCV(BigInt(args.escrowId)), boolCV(args.refundPayer)],
        network: getStacksNetwork(),
    };
}
