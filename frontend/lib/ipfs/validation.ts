/**
 * File validation rules shared between the client (pre-upload UI
 * feedback) and the server (route handler hard limits).
 *
 * The two sides must use the same numbers so a file that passes the
 * picker isn't rejected by the API.
 */

export const IPFS_LIMITS = {
    /** Hard cap on a single file upload, in bytes. */
    maxFileBytes: 10 * 1024 * 1024, // 10 MB
} as const;

export const ALLOWED_IMAGE_MIME = new Set<string>([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export const ALLOWED_EVIDENCE_MIME = new Set<string>([
    ...ALLOWED_IMAGE_MIME,
    "video/mp4",
    "video/webm",
    "application/pdf",
]);

export type ValidationResult =
    | { ok: true }
    | { ok: false; reason: string };

export function validateImageUpload(file: File | Blob, fileName?: string): ValidationResult {
    return validateAgainst(file, ALLOWED_IMAGE_MIME, fileName);
}

export function validateEvidenceUpload(file: File | Blob, fileName?: string): ValidationResult {
    return validateAgainst(file, ALLOWED_EVIDENCE_MIME, fileName);
}

function validateAgainst(
    file: File | Blob,
    allowedTypes: Set<string>,
    fileName?: string,
): ValidationResult {
    const name = fileName ?? ("name" in file ? (file as File).name : "file");

    if (file.size <= 0) {
        return { ok: false, reason: `${name} is empty` };
    }
    if (file.size > IPFS_LIMITS.maxFileBytes) {
        return {
            ok: false,
            reason: `${name} is ${formatBytes(file.size)}, larger than the ${formatBytes(IPFS_LIMITS.maxFileBytes)} limit`,
        };
    }
    if (!allowedTypes.has(file.type)) {
        return {
            ok: false,
            reason: `${name} has unsupported type "${file.type || "unknown"}"`,
        };
    }
    return { ok: true };
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
