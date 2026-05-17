# lib/ipfs

IPFS upload + gateway helpers for the CarIn frontend.

## Surface

| Module | Used from | What it does |
| --- | --- | --- |
| `pinata.ts` | server (Route Handlers only) | Pin a file or JSON object to Pinata using `PINATA_JWT`. |
| `validation.ts` | both | Shared MIME / size rules (`validateImageUpload`, `validateEvidenceUpload`, `IPFS_LIMITS`). |
| `gateway.ts` | both | Build gateway URLs (`buildGatewayUrl`, `getFallbackGateways`, `normaliseCid`). |
| `../ipfs.ts` | browser | Thin wrapper around `/api/ipfs/upload[-json]`: `uploadToIPFS`, `uploadImageToIPFS`, `uploadMetadataToIPFS`. |

## Configuration

| Env var | Where it's read | Required |
| --- | --- | --- |
| `PINATA_JWT` | server only (`pinata.ts`) | Yes, for actual uploads. Server-side only — never `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_IPFS_GATEWAY` | browser and server | No — defaults to `https://gateway.pinata.cloud`. |

`PINATA_JWT` is obtained from the Pinata dashboard → API Keys → "New JWT". Anything from a free or paid Pinata account works.

## Why a server route instead of calling Pinata from the browser?

The Pinata JWT acts as a bearer token for the entire account. If we shipped it to the browser (via `NEXT_PUBLIC_…`), every visitor could pin arbitrary data and burn the storage quota. The Route Handlers under `app/api/ipfs/` hold the JWT and proxy the upload, so the credential stays on the server.

## How uploads flow

```
ImageUpload.tsx
  └─► lib/ipfs.ts: uploadImageToIPFS(file)
        └─► validation.ts: validateImageUpload(file)
        └─► fetch POST /api/ipfs/upload
              └─► app/api/ipfs/upload/route.ts
                    └─► validation.ts: validateEvidenceUpload(file)
                    └─► pinata.ts: pinFile(file)
                          └─► Pinata pinFileToIPFS
```

The validation step runs twice on purpose — client-side for UX, server-side as the source of truth.

## Limits

- 10 MB per file (`IPFS_LIMITS.maxFileBytes`)
- 1 MB per JSON metadata pin (enforced in `/api/ipfs/upload-json`)
- Allowed file types: JPEG, PNG, WebP, GIF, MP4, WebM, PDF

Bump the constants in `validation.ts` (and the JSON cap in `upload-json/route.ts`) if you need different limits.
