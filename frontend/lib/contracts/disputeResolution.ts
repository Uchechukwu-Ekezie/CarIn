/**
 * DisputeResolution Contract Interface for Stacks
 * Contract name and function definitions for Stacks Clarity contract
 */

export const DISPUTE_RESOLUTION_CONTRACT = "dispute-resolution";

// Contract addresses for Stacks
export const DISPUTE_RESOLUTION_ADDRESSES = {
  testnet: process.env.NEXT_PUBLIC_STACKS_DISPUTE_ADDRESS_TESTNET || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  mainnet: process.env.NEXT_PUBLIC_STACKS_DISPUTE_ADDRESS_MAINNET || ""
};

export enum ResolutionType {
  Automated = 0,
  PendingVote = 1,
  Manual = 2
}

export interface DisputeDetails {
  disputeId: string; // Using string for large unit ids in Stacks
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

export interface Evidence {
  evidenceId: string;
  disputeId: string;
  submittedBy: string;
  evidenceType: number;
  evidenceHash: string;
  timestamp: number;
  description: string;
}

export interface CheckInData {
  bookingId: string;
  checkInTime: number;
  checkOutTime: number;
  checkedIn: boolean;
  checkedOut: boolean;
  verifiedBy: string;
}

export interface Vote {
  voter: string;
  supportsRefund: boolean;
  weight: string;
  timestamp: number;
  justification: string;
}
