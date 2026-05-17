import {
    validateImageUpload,
    validateEvidenceUpload,
    IPFS_LIMITS,
    formatBytes,
} from "../validation";

function fileOfSize(name: string, type: string, bytes: number): File {
    return new File([new Uint8Array(bytes)], name, { type });
}

describe("validateImageUpload", () => {
    it("accepts a small JPEG", () => {
        const f = fileOfSize("ok.jpg", "image/jpeg", 1024);
        expect(validateImageUpload(f)).toEqual({ ok: true });
    });

    it("accepts PNG, WebP, and GIF", () => {
        for (const type of ["image/png", "image/webp", "image/gif"]) {
            expect(validateImageUpload(fileOfSize("x", type, 1024))).toEqual({ ok: true });
        }
    });

    it("rejects a PDF", () => {
        const f = fileOfSize("doc.pdf", "application/pdf", 1024);
        const result = validateImageUpload(f);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.reason).toMatch(/unsupported type/);
    });

    it("rejects an empty file", () => {
        const f = fileOfSize("empty.png", "image/png", 0);
        const result = validateImageUpload(f);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.reason).toMatch(/empty/);
    });

    it("rejects a file over the size limit", () => {
        const tooBig = fileOfSize("big.jpg", "image/jpeg", IPFS_LIMITS.maxFileBytes + 1);
        const result = validateImageUpload(tooBig);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.reason).toMatch(/larger than/);
    });
});

describe("validateEvidenceUpload", () => {
    it("accepts the same image types plus PDF and MP4", () => {
        for (const type of [
            "image/jpeg",
            "image/png",
            "video/mp4",
            "video/webm",
            "application/pdf",
        ]) {
            expect(validateEvidenceUpload(fileOfSize("x", type, 1024))).toEqual({ ok: true });
        }
    });

    it("rejects an unknown MIME", () => {
        const result = validateEvidenceUpload(fileOfSize("x.bin", "application/octet-stream", 1024));
        expect(result.ok).toBe(false);
    });
});

describe("formatBytes", () => {
    it("formats bytes / KB / MB", () => {
        expect(formatBytes(512)).toBe("512 B");
        expect(formatBytes(2048)).toBe("2.0 KB");
        expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    });
});
