// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RewardsToken
 * @notice ERC20 token for CarIn parking platform rewards and governance
 * @dev Implements ERC20Votes for governance participation
 *      - Minting controlled by RewardsManager
 *      - Burnable by users
 *      - Pausable in emergencies
 *      - Voting power for governance
 */
contract RewardsToken is ERC20, ERC20Burnable, ERC20Votes, Ownable, Pausable {
    // Address of the RewardsManager contract that can mint tokens
    address public rewardsManager;

    // Maximum supply cap (if needed)
    uint256 public maxSupply;

    // Events
    event RewardsManagerUpdated(address indexed oldManager, address indexed newManager);
    event MaxSupplyUpdated(uint256 oldMaxSupply, uint256 newMaxSupply);
    event TokensMinted(address indexed to, uint256 amount, string reason);

    // Modifier to restrict minting to RewardsManager
    modifier onlyRewardsManager() {
        require(msg.sender == rewardsManager, "RewardsToken: Only RewardsManager can mint");
        _;
    }

    /**
     * @notice Constructor for RewardsToken
     * @param _name Token name (e.g., "CarIn Rewards")
     * @param _symbol Token symbol (e.g., "CARIN")
     * @param _initialSupply Initial supply to mint to deployer
     * @param _maxSupply Maximum supply cap (0 for unlimited)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        uint256 _maxSupply
    ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        rewardsManager = msg.sender; // Temporarily set to deployer, update later

        if (_initialSupply > 0) {
            _mint(msg.sender, _initialSupply);
        }
    }

    /**
     * @notice Mint new tokens (only callable by RewardsManager)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @param reason Reason for minting (for events/logging)
     */
    function mint(address to, uint256 amount, string memory reason) external onlyRewardsManager whenNotPaused {
        if (maxSupply > 0) {
            require(totalSupply() + amount <= maxSupply, "RewardsToken: Would exceed max supply");
        }
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    /**
     * @notice Update the RewardsManager address
     * @param _rewardsManager New RewardsManager address
     */
    function setRewardsManager(address _rewardsManager) external onlyOwner {
        require(_rewardsManager != address(0), "RewardsToken: Invalid address");
        address oldManager = rewardsManager;
        rewardsManager = _rewardsManager;
        emit RewardsManagerUpdated(oldManager, _rewardsManager);
    }

    /**
     * @notice Update the maximum supply
     * @param _maxSupply New maximum supply (0 for unlimited)
     */
    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(_maxSupply == 0 || _maxSupply >= totalSupply(), "RewardsToken: Max supply below current supply");
        uint256 oldMaxSupply = maxSupply;
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(oldMaxSupply, _maxSupply);
    }

    /**
     * @notice Pause token transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Override required by Solidity for multiple inheritance
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
        whenNotPaused
    {
        super._update(from, to, value);
    }

    // Override to prevent transfers when paused
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}

