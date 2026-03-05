# PaymentEscrow API Reference

## Functions

### createEscrow
Creates an escrow with native CELO.

```solidity
function createEscrow(
    uint256 bookingId,
    address payee,
    uint256 releaseTime,
    uint256 expirationTime
) external payable returns (uint256)
```

### createEscrowERC20
Creates an escrow with ERC20 token.

```solidity
function createEscrowERC20(
    uint256 bookingId,
    address payee,
    address token,
    uint256 amount,
    uint256 releaseTime,
    uint256 expirationTime
) external returns (uint256)
```

### releaseEscrow
Releases escrow to payee after release time.

```solidity
function releaseEscrow(uint256 escrowId) external
```

### automaticRelease
Automatically releases escrow after grace period.

```solidity
function automaticRelease(uint256 escrowId) external
```

### refundEscrow
Refunds full escrow amount to payer.

```solidity
function refundEscrow(uint256 escrowId) external
```

### partialRefund
Performs partial refund splitting amount between payer and payee.

```solidity
function partialRefund(
    uint256 escrowId,
    uint256 refundAmount,
    uint256 releaseAmount
) external
```

### fileDispute
Files a dispute for an escrow.

```solidity
function fileDispute(
    uint256 escrowId,
    string memory reason,
    bytes memory evidenceHash
) external
```

### resolveDispute
Resolves a dispute (owner only).

```solidity
function resolveDispute(
    uint256 disputeId,
    bool refundApproved,
    uint256 refundAmount,
    uint256 releaseAmount
) external onlyOwner
```

### handleExpiredEscrow
Handles expired escrows by refunding to payer.

```solidity
function handleExpiredEscrow(uint256 escrowId) external
```

