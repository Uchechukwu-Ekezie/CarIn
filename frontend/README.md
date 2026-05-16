# CarIn Frontend

Next.js 14 app for the CarIn decentralized parking platform.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Wallet / chain**: `@stacks/connect` (Stacks blockchain)
- **Maps**: Leaflet + `react-leaflet` (with `leaflet.markercluster`)
- **QR codes**: `qrcode.react`, `html5-qrcode`
- **Styling**: Tailwind CSS
- **Tests**: Jest

> The previous version of this README listed Reown AppKit and the
> Celo network. That predates the migration to Stacks Clarity — the
> canonical wallet connector is now `@stacks/connect`. See
> `../ARCHITECTURE.md` for the dual-track rationale.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with the variables this app expects (see
   `lib/` and `constants/` for the current set — at minimum a Stacks
   network selector):

   ```
   NEXT_PUBLIC_STACKS_NETWORK=testnet
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | `next lint` |
| `npm test` | Jest |

## Features

- Wallet connection via `@stacks/connect`
- Real-time parking spot discovery on a Leaflet map
- Booking flow with QR-code check-in
- Owner dashboard (listings, earnings, statistics)
- Dispute submission and review UI
- Rewards dashboard backed by the Clarity rewards contracts

## Known gaps

The Stacks contract integration is still being wired up — see the
`// TODO` comments in `components/booking/`, `components/owner/`,
`components/disputes/`, and `components/rewards/`. IPFS uploads for
spot photos and dispute evidence are also stubbed.
