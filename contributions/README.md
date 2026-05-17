# contributions/

Staging folder for **proposed V2 EVM contracts**. Files here are
under review and are **not deployed**. Nothing in this folder is
referenced by the canonical Clarity tree under `../smartcontracts/`
or by the deployed Solidity reference under `../smartcontracts-evm/`.

## What's here

| File | Replaces | Status |
| --- | --- | --- |
| `ParkingSpotV2.sol` | `../smartcontracts-evm/contracts/ParkingSpot.sol` | Pending review |
| `PaymentEscrowV2.sol` | `../smartcontracts-evm/contracts/PaymentEscrow.sol` | Pending review |
| `DisputeResolutionV2.sol` | `../smartcontracts-evm/contracts/DisputeResolution.sol` | Pending review |

## Process

1. Open a PR that adds or modifies a file under `contributions/`.
2. The PR description should call out the behavioural delta vs. the
   V1 contract it replaces, and any storage-layout implications for
   an in-place upgrade (most relevant if a proxy is ever introduced).
3. On approval, the file is either:
   - **Ported to Clarity** under `../smartcontracts/` (preferred — the
     Clarity tree is the canonical implementation), or
   - **Promoted into `../smartcontracts-evm/contracts/`** if there is
     a specific reason to ship the change on the EVM side first.

## Why this folder exists

Keeping these drafts out of the deployed contract folders prevents
them from being accidentally pulled into a compile target or
deployment script while the design is still being discussed. Once a
V2 design lands in the canonical tree, the corresponding file here
should be deleted in the same PR.

See `../ARCHITECTURE.md` for the overall dual-track strategy.
