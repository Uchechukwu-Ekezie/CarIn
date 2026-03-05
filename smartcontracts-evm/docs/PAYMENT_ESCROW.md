# PaymentEscrow Contract Documentation

## Overview

The PaymentEscrow contract handles escrowed payments for parking bookings with support for:
- Multiple token types (CELO, cUSD, cEUR)
- Automatic time-based releases
- Partial refunds
- Dispute resolution
- Expired escrow handling

## Features

### Escrow Creation
- Native CELO escrow creation
- ERC20 token escrow creation (cUSD, cEUR)
- Configurable release and expiration times

### Release Mechanisms
- Manual release by payee
- Automatic release after grace period
- Time-based automatic releases

### Refund Mechanisms
- Full refund to payer
- Partial refund (split between payer and payee)
- Expired escrow refunds

### Dispute Resolution
- File disputes with evidence (IPFS hash)
- Owner-mediated dispute resolution
- Automated refund/release based on resolution

## Security Features
- Reentrancy guards on all state-changing functions
- SafeERC20 for secure token transfers
- Access control via Ownable
- Comprehensive input validation

