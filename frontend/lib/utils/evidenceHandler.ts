/**
 * Evidence Handler Utilities
 * Utilities for handling dispute evidence submission, IPFS uploads, and validation
 */

import { uploadToIPFS } from "@/lib/ipfs";
import { buildGatewayUrl } from "@/lib/ipfs/gateway";
import { validateEvidenceUpload } from "@/lib/ipfs/validation";

export enum EvidenceType {
  CheckInTimestamp = 0,
  CheckOutTimestamp = 1,
  Image = 2,
  Video = 3,
  Document = 4,
  LocationData = 5,
  Other = 6
}

export interface EvidenceMetadata {
  type: EvidenceType;
  hash: string; // IPFS hash
  description: string;
  timestamp: number;
  fileUrl?: string;
}

export interface DisputeEvidence {
  evidenceId: number;
  disputeId: number;
  submittedBy: string;
  evidenceType: EvidenceType;
  evidenceHash: string;
  timestamp: number;
  description: string;
}

/**
 * Upload dispute evidence to IPFS. Returns the CID (Pinata
 * pinFileToIPFS hash). Accepts File (preferred — preserves the
 * filename for the Pinata-side label) or a bare Blob.
 *
 * The `type` parameter is preserved on the caller side; the
 * evidence-type → on-chain hash association happens when the CID is
 * submitted via dispute-resolution.add-evidence.
 */
export async function uploadEvidenceToIPFS(
  file: File | Blob,
  _type: EvidenceType
): Promise<string> {
  const named =
    file instanceof File ? file : new File([file], "evidence", { type: file.type });
  const { hash } = await uploadToIPFS(named);
  return hash;
}

/**
 * Convert IPFS hash to bytes32 format for smart contract
 */
export function ipfsHashToBytes(hash: string): string {
  // Convert IPFS hash (typically base58) to bytes
  // This is a simplified version - actual implementation may vary
  return '0x' + Buffer.from(hash).toString('hex').slice(0, 64);
}

/**
 * Get IPFS gateway URL from a CID. Delegates to the shared gateway
 * module so the choice of primary gateway lives in one place
 * (NEXT_PUBLIC_IPFS_GATEWAY).
 */
export function getIPFSGatewayURL(hash: string): string {
  return buildGatewayUrl(hash);
}

/**
 * Validate evidence before submission. Delegates the file-level
 * checks (size, MIME type) to the shared validateEvidenceUpload
 * so that the picker UI, this helper, and the /api/ipfs/upload
 * route are all enforcing the same rules.
 */
export function validateEvidence(
  type: EvidenceType,
  file?: File | Blob,
  description?: string
): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: "Evidence description is required" };
  }

  const requiresFile =
    type === EvidenceType.Image ||
    type === EvidenceType.Video ||
    type === EvidenceType.Document;
  if (requiresFile && !file) {
    return { valid: false, error: "File is required for this evidence type" };
  }
  if (!file) return { valid: true };

  const result = validateEvidenceUpload(file);
  return result.ok ? { valid: true } : { valid: false, error: result.reason };
}

/**
 * Prepare evidence metadata for submission
 */
export function prepareEvidenceMetadata(
  type: EvidenceType,
  hash: string,
  description: string,
  fileUrl?: string
): EvidenceMetadata {
  return {
    type,
    hash,
    description,
    timestamp: Math.floor(Date.now() / 1000),
    fileUrl
  };
}

/**
 * Format evidence type for display
 */
export function formatEvidenceType(type: EvidenceType): string {
  const types = {
    [EvidenceType.CheckInTimestamp]: 'Check-in Timestamp',
    [EvidenceType.CheckOutTimestamp]: 'Check-out Timestamp',
    [EvidenceType.Image]: 'Image',
    [EvidenceType.Video]: 'Video',
    [EvidenceType.Document]: 'Document',
    [EvidenceType.LocationData]: 'Location Data',
    [EvidenceType.Other]: 'Other'
  };
  return types[type] || 'Unknown';
}

