# PaymentEscrow Events Reference

## Event List

### EscrowCreated
Emitted when a new escrow is created.

```solidity
event EscrowCreated(
    uint256 indexed escrowId,
    uint256 indexed bookingId,
    address indexed payer,
    address payee,
    uint256 amount,
    address token,
    uint256 releaseTime
);
```

### EscrowReleased
Emitted when escrow is released to payee.

```solidity
event EscrowReleased(
    uint256 indexed escrowId,
    address indexed payee,
    uint256 amount,
    uint256 timestamp
);
```

### EscrowRefunded
Emitted when escrow is refunded to payer.

```solidity
event EscrowRefunded(
    uint256 indexed escrowId,
    address indexed payer,
    uint256 amount,
    uint256 timestamp
);
```

### PartialRefund
Emitted when a partial refund is executed.

```solidity
event PartialRefund(
    uint256 indexed escrowId,
    address indexed payer,
    uint256 refundAmount,
    uint256 remainingAmount,
    uint256 timestamp
);
```

### DisputeFiled
Emitted when a dispute is filed.

```solidity
event DisputeFiled(
    uint256 indexed disputeId,
    uint256 indexed escrowId,
    address indexed filedBy,
    string reason,
    bytes evidenceHash
);
```

### DisputeResolved
Emitted when a dispute is resolved.

```solidity
event DisputeResolved(
    uint256 indexed disputeId,
    uint256 indexed escrowId,
    address resolvedBy,
    bool refundApproved,
    uint256 timestamp
);
```

### AutomaticRelease
Emitted when escrow is automatically released.

```solidity
event AutomaticRelease(
    uint256 indexed escrowId,
    address indexed payee,
    uint256 amount,
    uint256 timestamp
);
```

### EscrowExpired
Emitted when an escrow expires.

```solidity
event EscrowExpired(
    uint256 indexed escrowId,
    address indexed payer,
    uint256 amount,
    uint256 timestamp
);
```

