# PaymentEscrow Changelog

## [2.0.0] - Enhanced Version

### Added
- EscrowStatus and DisputeStatus enums
- Enhanced Escrow struct with status tracking
- Dispute struct and dispute resolution system
- Partial refund functionality
- Automatic release with grace period
- Expired escrow handling
- Multi-token support (CELO, cUSD, cEUR)
- Comprehensive events for all actions
- SafeERC20 for secure token transfers
- Configuration functions for owner
- Payer/payee escrow tracking

### Changed
- Constructor now requires token addresses
- Enhanced event emissions with timestamps
- Improved security with additional checks

### Security
- All functions use ReentrancyGuard
- SafeERC20 for all ERC20 operations
- Comprehensive input validation
- Access control improvements

## [1.0.0] - Initial Version

### Added
- Basic escrow creation
- Release and refund functionality
- Native CELO support

