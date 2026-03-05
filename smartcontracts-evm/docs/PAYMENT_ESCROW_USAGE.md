# PaymentEscrow Usage Examples

## Basic Usage

### Creating an Escrow with Native CELO

```javascript
const bookingId = 1;
const payee = "0x...";
const releaseTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const expirationTime = 0; // Use default (30 days)

const tx = await paymentEscrow.createEscrow(
  bookingId,
  payee,
  releaseTime,
  expirationTime,
  { value: ethers.parseEther("1.0") }
);
```

### Creating an Escrow with cUSD

```javascript
const amount = ethers.parseEther("100");
await cUSDToken.approve(paymentEscrow.address, amount);

const tx = await paymentEscrow.createEscrowERC20(
  bookingId,
  payee,
  cUSDTokenAddress,
  amount,
  releaseTime,
  expirationTime
);
```

### Releasing an Escrow

```javascript
await paymentEscrow.connect(payee).releaseEscrow(escrowId);
```

### Filing a Dispute

```javascript
const evidenceHash = ethers.toUtf8Bytes("QmIPFSHash...");
await paymentEscrow.connect(payer).fileDispute(
  escrowId,
  "Service not provided",
  evidenceHash
);
```

### Partial Refund (Owner Only)

```javascript
const refundAmount = ethers.parseEther("0.3");
const releaseAmount = ethers.parseEther("0.7");

await paymentEscrow.connect(owner).partialRefund(
  escrowId,
  refundAmount,
  releaseAmount
);
```

