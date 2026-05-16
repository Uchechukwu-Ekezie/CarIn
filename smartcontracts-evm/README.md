# CarIn EVM Smart Contracts (reference)

Solidity / Hardhat implementation of CarIn for Celo. This tree is the
**reference implementation** — it predates the migration to Stacks
Clarity. The canonical contracts now live under `../smartcontracts/`
and are written in Clarity. See `../ARCHITECTURE.md` for the
dual-track rationale.

New feature work should target the Clarity tree first. The Solidity
tree is kept for behavioural parity, EVM redeployment, and historical
context.

## Contracts

- **ParkingSpot.sol** — listings, owner registration, availability
- **PaymentEscrow.sol** — escrowed booking payments and refunds
- **DisputeResolution.sol** — dispute lifecycle and resolution
- **RewardsToken.sol** — ERC-20 rewards token
- **RewardsManager.sol** — issuance / distribution of the rewards token

Proposed V2 variants of three of these contracts live under
`../contributions/` and are not deployed; see
`../contributions/README.md`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env`:

   ```
   CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
   PRIVATE_KEY=your_wallet_private_key
   CELOSCAN_API_KEY=your_celoscan_api_key
   ```

3. Compile and test:

   ```bash
   npm run compile
   npm run test
   ```

4. Deploy to Alfajores testnet:

   ```bash
   npm run deploy:alfajores
   ```

## Network Configuration

| Network | Chain ID |
| --- | --- |
| Alfajores testnet | 44787 |
| Celo mainnet | 42220 |

## Security

- Uses OpenZeppelin contracts (access control, ERC-20, reentrancy)
- Reentrancy guards on funds-moving functions
- Role-based access control for owner / arbitrator operations
- Audit status: unaudited — do not deploy with real funds without an audit
