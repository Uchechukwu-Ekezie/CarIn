# CarIn

![Stacks](https://img.shields.io/badge/blockchain-Stacks-5546FF)
![Clarity](https://img.shields.io/badge/contracts-Clarity_2.0-7765E3)
![Next.js](https://img.shields.io/badge/frontend-Next.js_14-000000)
![TypeScript](https://img.shields.io/badge/lang-TypeScript-3178C6)
![Node](https://img.shields.io/badge/node-%E2%89%A518.17-339933)

CarIn is a decentralized peer-to-peer parking spot booking platform. Owners list spots; renters discover them on a map, book, and pay; funds are held in on-chain escrow until the booking completes. Disputes, reviews, and a rewards token round out the system.

The canonical implementation targets the **Stacks** blockchain (Clarity). A reference Solidity implementation for **Celo** is kept under `smartcontracts-evm/` (see `ARCHITECTURE.md` for the dual-track rationale).

## Project Structure

| Path | Purpose |
| --- | --- |
| `frontend/` | Next.js 14 app — wallet, map discovery, booking, owner dashboard |
| `smartcontracts/` | Clarity contracts (primary) — Clarinet 2.0 project |
| `smartcontracts-evm/` | Solidity contracts (reference) — Hardhat project, Celo target |
| `contributions/` | Proposed V2 Solidity contracts under review |
| `.github/` | Issue/PR templates and CI workflows |

## Prerequisites

- **Node.js** `18.17.0` or higher (see `.nvmrc`)
- **npm** `9.0.0` or higher
- **Clarinet** (for working on Clarity contracts) — install via `brew install clarinet`

## Getting Started

```bash
git clone https://github.com/Uchechukwu-Ekezie/CarIn.git
cd CarIn
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # if present, otherwise see frontend/README.md
npm run dev
```

App runs on http://localhost:3000.

### Clarity contracts

```bash
cd smartcontracts
clarinet check       # static analysis on all contracts
npm install
npm test             # Clarinet TypeScript test runner
```

### EVM contracts (reference)

```bash
cd smartcontracts-evm
npm install
npx hardhat compile
npx hardhat test
```

## Further reading

| Doc | What it covers |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design and the Stacks vs. EVM dual-track strategy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branch, commit, and PR conventions |
| [SECURITY.md](SECURITY.md) | How to report a vulnerability privately |
| [`frontend/README.md`](frontend/README.md) | Next.js app setup and feature surface |
| [`smartcontracts/Clarinet.toml`](smartcontracts/Clarinet.toml) | Clarity contract manifest |
| [`smartcontracts-evm/README.md`](smartcontracts-evm/README.md) | Solidity reference implementation |
| [`contributions/README.md`](contributions/README.md) | Proposed V2 contracts under review |

## Status

CarIn is pre-production. The Clarity contract surface is in place
and the EVM reference implementation has a full Hardhat test suite,
but the frontend-to-contract integration and a complete Clarinet
test suite are still in progress. See `ARCHITECTURE.md` → "What is
not here yet" for the current punch list.
