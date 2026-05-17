/**
 * IPFS gateway URL construction with a single env-driven base.
 *
 * The primary gateway is read from `NEXT_PUBLIC_IPFS_GATEWAY` (so
 * the same value is available in both browser and server code).
 * Default: https://gateway.pinata.cloud — the dedicated gateway you
 * get with a Pinata account.
 *
 * `buildGatewayUrl` returns a single URL for the primary gateway.
 * `getFallbackGateways` returns an ordered list (primary first) so
 * a caller can implement an `<img onError={fallback}>` chain
 * without depending on this module.
 */

const DEFAULT_GATEWAY = "https://gateway.pinata.cloud";

const FALLBACK_GATEWAYS = [
    "https://ipfs.io",
    "https://cloudflare-ipfs.com",
    "https://nftstorage.link",
] as const;

function getPrimary(): string {
    const raw =
        (typeof process !== "undefined"
            ? process.env.NEXT_PUBLIC_IPFS_GATEWAY
            : undefined) ?? DEFAULT_GATEWAY;
    return raw.replace(/\/$/, "");
}

/**
 * Build a single gateway URL for the given CID.
 * Accepts both bare CIDs ("Qm...") and `ipfs://...` URIs.
 */
export function buildGatewayUrl(cidOrUri: string): string {
    const cid = normaliseCid(cidOrUri);
    return `${getPrimary()}/ipfs/${cid}`;
}

/**
 * Ordered list of gateways (primary first, then known public
 * fallbacks). Each entry is a full base URL — append `/ipfs/<CID>`.
 */
export function getFallbackGateways(): string[] {
    const primary = getPrimary();
    return [primary, ...FALLBACK_GATEWAYS.filter((g) => g !== primary)];
}

/** Strip an `ipfs://` prefix if present; otherwise pass through. */
export function normaliseCid(cidOrUri: string): string {
    if (cidOrUri.startsWith("ipfs://")) return cidOrUri.slice("ipfs://".length);
    return cidOrUri;
}
