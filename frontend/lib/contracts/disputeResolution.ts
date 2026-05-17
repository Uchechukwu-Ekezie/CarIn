/**
 * Typed surface for the `dispute-resolution` Clarity contract.
 *
 * The previous version of this file declared a much larger
 * DisputeDetails shape than the deployed Clarity contract actually
 * supports (resolved-by, refund-percentage, votes, …). Those fields
 * were never on chain — they belonged to the older EVM design. The
 * record below matches the actual on-chain shape.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    boolCV,
    stringUtf8CV,
    stringAsciiCV,
    standardPrincipalCV,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapOptionalTuple } from "./codec";

export const DISPUTE_STATUS = {
    PENDING: 0,
    RESOLVED: 1,
} as const;

export type DisputeStatus = (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

export interface DisputeRecord {
    id: number;
    escrowId: number;
    bookingId: number;
    filedBy: string;
    opposingParty: string;
    reason: string;
    status: DisputeStatus;
}

export interface EvidenceRecord {
    id: number;
    disputeId: number;
    submittedBy: string;
    evidenceHash: string;
}

const REF = () => getContractRef("disputeResolution");

export async function getDispute(
    disputeId: number | bigint,
    senderAddress?: string,
): Promise<DisputeRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-dispute",
        functionArgs: [uintCV(BigInt(disputeId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;
    return {
        id: Number(disputeId),
        escrowId: Number(tuple["escrow-id"]),
        bookingId: Number(tuple["booking-id"]),
        filedBy: String(tuple["filed-by"]),
        opposingParty: String(tuple["opposing-party"]),
        reason: String(tuple["reason"]),
        status: Number(tuple["status"]) as DisputeStatus,
    };
}

export async function getEvidence(
    evidenceId: number | bigint,
    senderAddress?: string,
): Promise<EvidenceRecord | null> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-evidence",
        functionArgs: [uintCV(BigInt(evidenceId))],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    const tuple = unwrapOptionalTuple(result);
    if (!tuple) return null;
    return {
        id: Number(evidenceId),
        disputeId: Number(tuple["dispute-id"]),
        submittedBy: String(tuple["submitted-by"]),
        evidenceHash: String(tuple["evidence-hash"]),
    };
}

export function buildFileDisputeCall(args: {
    escrowId: number | bigint;
    bookingId: number | bigint;
    opposingPartyAddress: string;
    reason: string;
}) {
    return {
        ...REF(),
        functionName: "file-dispute",
        functionArgs: [
            uintCV(BigInt(args.escrowId)),
            uintCV(BigInt(args.bookingId)),
            standardPrincipalCV(args.opposingPartyAddress),
            stringUtf8CV(args.reason),
        ],
        network: getStacksNetwork(),
    };
}

export function buildAddEvidenceCall(args: {
    disputeId: number | bigint;
    evidenceHash: string; // (string-ascii 64) — pass the IPFS CID or hex digest
}) {
    return {
        ...REF(),
        functionName: "add-evidence",
        functionArgs: [
            uintCV(BigInt(args.disputeId)),
            stringAsciiCV(args.evidenceHash),
        ],
        network: getStacksNetwork(),
    };
}

export function buildResolveDisputeCall(args: {
    disputeId: number | bigint;
    refundPayer: boolean;
}) {
    return {
        ...REF(),
        functionName: "resolve-dispute",
        functionArgs: [uintCV(BigInt(args.disputeId)), boolCV(args.refundPayer)],
        network: getStacksNetwork(),
    };
}

// ---------------------------------------------------------------------------
// Legacy exports — these reflect the older (EVM-era) shape and are kept so
// components that haven't been migrated yet still compile. They describe
// fields that are NOT present in the deployed Clarity contract; new code
// should use DisputeRecord / EvidenceRecord above.
// ---------------------------------------------------------------------------

/** @deprecated Use the env-driven helpers in `./network` instead. */
export const DISPUTE_RESOLUTION_CONTRACT = "dispute-resolution";

/** @deprecated Use `getContractIdentifier('disputeResolution')`. */
export const DISPUTE_RESOLUTION_ADDRESSES = {
    testnet:
        process.env.NEXT_PUBLIC_STACKS_DISPUTE_ADDRESS_TESTNET ||
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    mainnet: process.env.NEXT_PUBLIC_STACKS_DISPUTE_ADDRESS_MAINNET || "",
};

/** @deprecated EVM-era enum, the on-chain Clarity contract has no equivalent. */
export enum ResolutionType {
    Automated = 0,
    PendingVote = 1,
    Manual = 2,
}

/** @deprecated Use DisputeRecord. */
export interface DisputeDetails {
    disputeId: string;
    escrowId: string;
    bookingId: string;
    filedBy: string;
    opposingParty: string;
    reason: string;
    primaryEvidenceHash: string;
    filedAt: number;
    resolutionType: ResolutionType;
    isResolved: boolean;
    resolvedBy: string;
    resolvedAt: number;
    refundApproved: boolean;
    refundPercentage: number;
}

/** @deprecated Use EvidenceRecord. */
export interface Evidence {
    evidenceId: string;
    disputeId: string;
    submittedBy: string;
    evidenceType: number;
    evidenceHash: string;
    timestamp: number;
    description: string;
}

/** @deprecated EVM-era shape, not on chain. */
export interface CheckInData {
    bookingId: string;
    checkInTime: number;
    checkOutTime: number;
    checkedIn: boolean;
    checkedOut: boolean;
    verifiedBy: string;
}

/** @deprecated EVM-era shape, not on chain. */
export interface Vote {
    voter: string;
    supportsRefund: boolean;
    weight: string;
    timestamp: number;
    justification: string;
}
