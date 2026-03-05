# Dispute Resolution Guide

## Overview

The PaymentEscrow contract includes a comprehensive dispute resolution mechanism that allows payers and payees to file disputes with evidence stored on IPFS.

## Dispute Process

### 1. Filing a Dispute

Either the payer or payee can file a dispute:

```javascript
const evidenceHash = ethers.toUtf8Bytes("QmIPFSHash...");
await paymentEscrow.connect(payer).fileDispute(
  escrowId,
  "Reason for dispute",
  evidenceHash
);
```

**Requirements:**
- Only payer or payee can file
- Escrow must be in pending status
- No existing dispute
- Must provide reason and evidence hash

### 2. Evidence Storage

Evidence should be stored on IPFS and the hash included:
- Check-in timestamps
- Photos of the parking spot
- Correspondence between parties
- Any relevant documentation

### 3. Resolution

Only the contract owner can resolve disputes:

```javascript
// Full refund
await paymentEscrow.connect(owner).resolveDispute(disputeId, true, 0, 0);

// Partial refund (40% to payer, 60% to payee)
await paymentEscrow.connect(owner).resolveDispute(
  disputeId,
  true,
  ethers.parseEther("0.4"),
  ethers.parseEther("0.6")
);

// Dispute rejected (release to payee)
await paymentEscrow.connect(owner).resolveDispute(disputeId, false, 0, 0);
```

## Best Practices

1. Store all evidence on IPFS before filing
2. Provide clear, detailed reasons
3. Include timestamps and relevant documentation
4. Resolve disputes promptly to maintain trust

