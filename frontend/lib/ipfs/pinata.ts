/**
 * Thin server-side wrapper around the Pinata pinning API.
 *
 * Reads `PINATA_JWT` from process.env (no `NEXT_PUBLIC_` prefix — the
 * JWT must stay server-side). All call sites are expected to live in
 * Next.js Route Handlers under `app/api/ipfs/*`; the browser never
 * sees the JWT.
 */

export interface PinataPinResult {
    cid: string;
    /** Bytes the file occupied on Pinata (echoed by the API). */
    pinSize: number;
    /** ISO timestamp from the Pinata response. */
    pinnedAt: string;
}

const PINATA_FILE_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

function getJwt(): string {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
        throw new PinataConfigError(
            "PINATA_JWT is not set. Add it to your server environment " +
            "(e.g. .env.local for local dev, Vercel project settings in prod).",
        );
    }
    return jwt;
}

/**
 * Pin a file (image, video, document, …) to IPFS via Pinata.
 *
 * `name` becomes the Pinata-side label visible in the Pinata dashboard;
 * it does not affect the CID.
 */
export async function pinFile(file: File | Blob, name?: string): Promise<PinataPinResult> {
    const jwt = getJwt();
    const form = new FormData();
    form.append("file", file);
    if (name) {
        form.append("pinataMetadata", JSON.stringify({ name }));
    }

    const res = await fetch(PINATA_FILE_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: form,
    });

    if (!res.ok) {
        const body = await safeText(res);
        throw new PinataUploadError(
            `Pinata pinFileToIPFS failed (${res.status}): ${body}`,
            res.status,
        );
    }

    const data = (await res.json()) as {
        IpfsHash: string;
        PinSize: number;
        Timestamp: string;
    };
    return { cid: data.IpfsHash, pinSize: data.PinSize, pinnedAt: data.Timestamp };
}

/**
 * Pin a JSON object as IPFS metadata. Useful for spot descriptions,
 * dispute evidence metadata, and similar small structured payloads.
 */
export async function pinJson(json: unknown, name?: string): Promise<PinataPinResult> {
    const jwt = getJwt();

    const res = await fetch(PINATA_JSON_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            pinataContent: json,
            ...(name ? { pinataMetadata: { name } } : {}),
        }),
    });

    if (!res.ok) {
        const body = await safeText(res);
        throw new PinataUploadError(
            `Pinata pinJSONToIPFS failed (${res.status}): ${body}`,
            res.status,
        );
    }

    const data = (await res.json()) as {
        IpfsHash: string;
        PinSize: number;
        Timestamp: string;
    };
    return { cid: data.IpfsHash, pinSize: data.PinSize, pinnedAt: data.Timestamp };
}

async function safeText(res: Response): Promise<string> {
    try {
        return await res.text();
    } catch {
        return "<no body>";
    }
}

export class PinataConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PinataConfigError";
    }
}

export class PinataUploadError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = "PinataUploadError";
        this.status = status;
    }
}
