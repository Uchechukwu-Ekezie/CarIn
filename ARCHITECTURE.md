# Architecture

This document describes how CarIn is organized today and the reasoning behind the dual-chain layout.

## High-level

```
                    ┌────────────────────────────┐
                    │        frontend (Next.js)  │
                    │ wallet · map · booking UI  │
                    └─────────────┬──────────────┘
                                  │ @stacks/connect
                                  ▼
   ┌──────────────────────────────────────────────────────────┐
   │                  smartcontracts/ (Clarity)               │
   │                                                          │
   │   user-registry ── car-registry ── parking-spot          │
   │                                       │                  │
   │                                       ▼                  │
   │                                   booking ─► payment-    │
   │                                       │      escrow      │
   │                                       ▼                  │
   │                            dispute-resolution            │
   │                                       │                  │
   │                                       ▼                  │
   │                            spot-reviews                  │
   │                                                          │
   │   carin-rewards-token ◄────── rewards-manager            │
   └──────────────────────────────────────────────────────────┘
```

## Why two contract trees?

The repository contains both Clarity and Solidity implementations. This is intentional but transitional.

- **`smartcontracts/` (Clarity, Stacks)** — the **canonical** implementation. All new feature work targets these contracts. The frontend wires against them via `@stacks/connect` and `@stacks/transactions`.
- **`smartcontracts-evm/` (Solidity, Celo)** — the **reference implementation** that predates the Stacks migration. Kept for behavioural parity checks and to make a future EVM redeployment cheaper if the project ever decides to go multi-chain. It is not the source of truth and should not receive new feature work.
- **`contributions/`** — a staging area for proposed V2 EVM contracts (`ParkingSpotV2`, `PaymentEscrowV2`, `DisputeResolutionV2`). These are not deployed. See `contributions/README.md`.

If you are making a behavioural change, change the Clarity contract first; only port to Solidity if the EVM tree is being kept in sync for a specific reason.

## Contract responsibilities (Clarity)

| Contract | Responsibility |
| --- | --- |
| `user-registry` | Stores user profile and reputation pointers |
| `car-registry` | Stores vehicle records keyed by user |
| `parking-spot` | Owner-created listings (location, price, availability) |
| `booking` | Time-windowed reservations against a spot |
| `payment-escrow` | Holds funds for the duration of a booking; releases on completion or refunds on cancel/dispute |
| `dispute-resolution` | Owner/renter dispute lifecycle and resolution outcomes |
| `spot-reviews` | Post-booking reviews tied to completed bookings |
| `carin-rewards-token` | SIP-010 fungible token used for incentives |
| `rewards-manager` | Distributes the rewards token on qualifying events |

Dependencies are declared in `smartcontracts/Clarinet.toml`.

## Frontend ↔ contract surface

The frontend reads on-chain state via read-only function calls and submits state changes by prompting the user to sign transactions through `@stacks/connect`. There is no backend service mediating the chain — the dapp talks to a Stacks node directly.

Off-chain media (spot photos, dispute evidence) is uploaded to IPFS and only the resulting CID is stored on-chain. The IPFS integration is in progress; see open TODOs under `frontend/components/`.

## What is not here yet

- Continuous integration (planned — see PR 2).
- A Clarinet test suite covering every contract (partial — see PR 3).
- Full IPFS upload pipeline (planned — see PR 5).
- A documented Stacks deployment / mainnet runbook.

This document should be updated whenever the contract surface or the cross-tree relationship changes.
