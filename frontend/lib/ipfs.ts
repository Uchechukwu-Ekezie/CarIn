/**
 * Browser-side IPFS upload helpers.
 *
 * These hit the project's own API routes (`/api/ipfs/upload`,
 * `/api/ipfs/upload-json`) which in turn pin to Pinata using a
 * server-side JWT. The browser never sees PINATA_JWT.
 *
 * The gateway URL helper is extracted into lib/ipfs/gateway.ts
 * in a follow-up commit and re-exported here.
 */

import {
    validateImageUpload,
    validateEvidenceUpload,
    type ValidationResult,
} from "./ipfs/validation";

export interface IPFSUploadResult {
    /** Raw IPFS CID (e.g. "bafy..." or "Qm..."). */
    hash: string;
    /** Convenience: full gateway URL pointing at the pinned content. */
    url: string;
    /** Bytes pinned, as reported by Pinata. */
    pinSize?: number;
}

interface ApiPinResponse {
    cid: string;
    pinSize: number;
    pinnedAt: string;
    url: string;
}

interface ApiErrorResponse {
    error: string;
}

export class IPFSValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "IPFSValidationError";
    }
}

export class IPFSUploadError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = "IPFSUploadError";
        this.status = status;
    }
}

/**
 * Upload a file (image, video, document) to IPFS via the project's
 * `/api/ipfs/upload` route. Pre-validates against the shared
 * evidence-upload rules so the user sees the error before a network
 * round-trip.
 */
export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
    assertValid(validateEvidenceUpload(file));
    return postFile("/api/ipfs/upload", file);
}

/**
 * Image-only variant — tighter validation (no PDF, no video).
 */
export async function uploadImageToIPFS(file: File): Promise<IPFSUploadResult> {
    assertValid(validateImageUpload(file));
    return postFile("/api/ipfs/upload", file);
}

/**
 * Pin a JSON object to IPFS as metadata.
 */
export async function uploadMetadataToIPFS(metadata: unknown): Promise<IPFSUploadResult> {
    const res = await fetch("/api/ipfs/upload-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
    });
    return toResult(await parseResponse(res));
}

/**
 * Build a gateway URL for an existing CID. Kept here for
 * backwards-compatibility with the previous module surface; the
 * implementation lives in lib/ipfs/gateway.ts.
 */
export { buildGatewayUrl as getIPFSGatewayURL } from "./ipfs/gateway";
export { getFallbackGateways, normaliseCid } from "./ipfs/gateway";

// ---------------------------------------------------------------------------

async function postFile(endpoint: string, file: File): Promise<IPFSUploadResult> {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(endpoint, { method: "POST", body: form });
    return toResult(await parseResponse(res));
}

function assertValid(result: ValidationResult): void {
    if (!result.ok) throw new IPFSValidationError(result.reason);
}

async function parseResponse(res: Response): Promise<ApiPinResponse> {
    if (!res.ok) {
        let message = `IPFS upload failed (HTTP ${res.status})`;
        try {
            const body = (await res.json()) as ApiErrorResponse;
            if (body?.error) message = body.error;
        } catch {
            // Body wasn't JSON; keep the generic message.
        }
        throw new IPFSUploadError(message, res.status);
    }
    return (await res.json()) as ApiPinResponse;
}

function toResult(data: ApiPinResponse): IPFSUploadResult {
    return { hash: data.cid, url: data.url, pinSize: data.pinSize };
}
