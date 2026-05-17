import { NextRequest, NextResponse } from "next/server";

import { pinFile, PinataConfigError, PinataUploadError } from "@/lib/ipfs/pinata";
import { validateEvidenceUpload } from "@/lib/ipfs/validation";

/**
 * POST /api/ipfs/upload
 * multipart/form-data with a single "file" field.
 *
 * Returns: { cid, pinSize, pinnedAt, url } on success.
 *
 * Validates against `validateEvidenceUpload` (a superset of image
 * types, since the same endpoint serves both spot photos and
 * dispute evidence). The same validator is used in the picker so
 * the limits stay in sync.
 */
export async function POST(request: NextRequest) {
    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "missing or non-file 'file' field" }, { status: 400 });
    }

    const validation = validateEvidenceUpload(file);
    if (!validation.ok) {
        return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    try {
        const result = await pinFile(file, file.name);
        const gateway = gatewayBase();
        return NextResponse.json({
            ...result,
            url: `${gateway}/ipfs/${result.cid}`,
        });
    } catch (err: unknown) {
        if (err instanceof PinataConfigError) {
            // 500 (not 400) — this is a server misconfiguration, not a bad client request.
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        if (err instanceof PinataUploadError) {
            return NextResponse.json(
                { error: err.message },
                { status: err.status ?? 502 },
            );
        }
        const message = err instanceof Error ? err.message : "unknown upload error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function gatewayBase(): string {
    return process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
}
