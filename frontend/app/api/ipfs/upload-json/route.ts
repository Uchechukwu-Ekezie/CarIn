import { NextRequest, NextResponse } from "next/server";

import { pinJson, PinataConfigError, PinataUploadError } from "@/lib/ipfs/pinata";

/**
 * POST /api/ipfs/upload-json
 * application/json body. The whole body is pinned as the IPFS object.
 *
 * Returns: { cid, pinSize, pinnedAt, url } on success.
 *
 * Used for structured metadata (e.g. a spot description object,
 * dispute evidence summary). For raw files, use /api/ipfs/upload.
 */
export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "expected a JSON body" }, { status: 400 });
    }
    if (body === null || typeof body !== "object") {
        return NextResponse.json(
            { error: "body must be a JSON object" },
            { status: 400 },
        );
    }

    // Reasonable cap so a single pinJSON request can't hold the
    // route handler open with a 50 MB payload.
    const serialized = JSON.stringify(body);
    if (serialized.length > 1_000_000) {
        return NextResponse.json(
            { error: "JSON payload exceeds 1 MB limit" },
            { status: 400 },
        );
    }

    try {
        const result = await pinJson(body);
        const gateway =
            process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://gateway.pinata.cloud";
        return NextResponse.json({
            ...result,
            url: `${gateway}/ipfs/${result.cid}`,
        });
    } catch (err: unknown) {
        if (err instanceof PinataConfigError) {
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
