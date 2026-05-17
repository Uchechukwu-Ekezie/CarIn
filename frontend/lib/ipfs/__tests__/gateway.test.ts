import { buildGatewayUrl, getFallbackGateways, normaliseCid } from "../gateway";

describe("normaliseCid", () => {
    it("strips the ipfs:// prefix", () => {
        expect(normaliseCid("ipfs://bafy123")).toBe("bafy123");
    });

    it("passes through a bare CID", () => {
        expect(normaliseCid("QmFoo")).toBe("QmFoo");
    });
});

describe("buildGatewayUrl", () => {
    const previousGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY;

    afterEach(() => {
        if (previousGateway === undefined) {
            delete process.env.NEXT_PUBLIC_IPFS_GATEWAY;
        } else {
            process.env.NEXT_PUBLIC_IPFS_GATEWAY = previousGateway;
        }
    });

    it("uses Pinata's gateway by default", () => {
        delete process.env.NEXT_PUBLIC_IPFS_GATEWAY;
        expect(buildGatewayUrl("QmFoo")).toBe("https://gateway.pinata.cloud/ipfs/QmFoo");
    });

    it("honours NEXT_PUBLIC_IPFS_GATEWAY when set", () => {
        process.env.NEXT_PUBLIC_IPFS_GATEWAY = "https://gw.example";
        expect(buildGatewayUrl("QmFoo")).toBe("https://gw.example/ipfs/QmFoo");
    });

    it("trims a trailing slash from the gateway base", () => {
        process.env.NEXT_PUBLIC_IPFS_GATEWAY = "https://gw.example/";
        expect(buildGatewayUrl("QmFoo")).toBe("https://gw.example/ipfs/QmFoo");
    });

    it("accepts an ipfs:// URI as input", () => {
        process.env.NEXT_PUBLIC_IPFS_GATEWAY = "https://gw.example";
        expect(buildGatewayUrl("ipfs://QmFoo")).toBe("https://gw.example/ipfs/QmFoo");
    });
});

describe("getFallbackGateways", () => {
    const previousGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY;

    afterEach(() => {
        if (previousGateway === undefined) {
            delete process.env.NEXT_PUBLIC_IPFS_GATEWAY;
        } else {
            process.env.NEXT_PUBLIC_IPFS_GATEWAY = previousGateway;
        }
    });

    it("returns the primary first, followed by known public gateways", () => {
        delete process.env.NEXT_PUBLIC_IPFS_GATEWAY;
        const list = getFallbackGateways();
        expect(list[0]).toBe("https://gateway.pinata.cloud");
        expect(list).toContain("https://ipfs.io");
        expect(list).toContain("https://cloudflare-ipfs.com");
    });

    it("does not duplicate the primary if it overlaps a fallback", () => {
        process.env.NEXT_PUBLIC_IPFS_GATEWAY = "https://ipfs.io";
        const list = getFallbackGateways();
        const occurrences = list.filter((g) => g === "https://ipfs.io").length;
        expect(occurrences).toBe(1);
    });
});
