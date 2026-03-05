// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Counter
 * @dev Enhanced Counter contract with mainnet-ready features including
 *      access control, bounds checking, pause functionality, and batch operations
 */
contract Counter is Ownable, Pausable, ReentrancyGuard {
    uint256 private _count;
    uint256 public maxCount;
    uint256 public minCount;
    
    // Track count history for analytics
    uint256[] private _countHistory;
    mapping(uint256 => uint256) public countAtTimestamp; // timestamp => count
    
    // Events
    event CountIncremented(uint256 newCount, address indexed by, uint256 timestamp);
    event CountDecremented(uint256 newCount, address indexed by, uint256 timestamp);
    event CountSet(uint256 oldCount, uint256 newCount, address indexed by);
    event CountReset(address indexed by);
    event CountAdded(uint256 amount, uint256 newCount, address indexed by);
    event CountSubtracted(uint256 amount, uint256 newCount, address indexed by);
    event MaxCountUpdated(uint256 oldMax, uint256 newMax);
    event MinCountUpdated(uint256 oldMin, uint256 newMin);
    
    // Modifiers
    modifier withinBounds(uint256 newValue) {
        require(newValue >= minCount, "Counter: value below minimum");
        require(maxCount == 0 || newValue <= maxCount, "Counter: value exceeds maximum");
        _;
    }
    
    /**
     * @dev Constructor sets initial count and optional bounds
     * @param initialCount Starting count value
     * @param _maxCount Maximum allowed count (0 = no limit)
     * @param _minCount Minimum allowed count (default 0)
     */
    constructor(
        uint256 initialCount,
        uint256 _maxCount,
        uint256 _minCount
    ) Ownable(msg.sender) {
        _count = initialCount;
        maxCount = _maxCount;
        minCount = _minCount;
        _countHistory.push(initialCount);
        countAtTimestamp[block.timestamp] = initialCount;
    }
    
    /**
     * @dev Increment count by 1
     */
    function increment() external whenNotPaused nonReentrant returns (uint256) {
        uint256 newCount = _count + 1;
        require(maxCount == 0 || newCount <= maxCount, "Counter: would exceed maximum");
        
        _count = newCount;
        _recordCountChange(newCount);
        
        emit CountIncremented(newCount, msg.sender, block.timestamp);
        return newCount;
    }
    
    /**
     * @dev Decrement count by 1
     */
    function decrement() external whenNotPaused nonReentrant returns (uint256) {
        require(_count > minCount, "Counter: underflow or below minimum");
        
        uint256 newCount = _count - 1;
        _count = newCount;
        _recordCountChange(newCount);
        
        emit CountDecremented(newCount, msg.sender, block.timestamp);
        return newCount;
    }
    
    /**
     * @dev Add custom amount to count
     * @param amount Amount to add
     */
    function add(uint256 amount) external whenNotPaused nonReentrant returns (uint256) {
        require(amount > 0, "Counter: amount must be greater than 0");
        
        uint256 newCount = _count + amount;
        require(maxCount == 0 || newCount <= maxCount, "Counter: would exceed maximum");
        require(newCount >= minCount, "Counter: would be below minimum");
        
        _count = newCount;
        _recordCountChange(newCount);
        
        emit CountAdded(amount, newCount, msg.sender);
        return newCount;
    }
    
    /**
     * @dev Subtract custom amount from count
     * @param amount Amount to subtract
     */
    function subtract(uint256 amount) external whenNotPaused nonReentrant returns (uint256) {
        require(amount > 0, "Counter: amount must be greater than 0");
        require(_count >= amount, "Counter: underflow");
        
        uint256 newCount = _count - amount;
        require(newCount >= minCount, "Counter: would be below minimum");
        
        _count = newCount;
        _recordCountChange(newCount);
        
        emit CountSubtracted(amount, newCount, msg.sender);
        return newCount;
    }
    
    /**
     * @dev Set count to a specific value (owner only)
     * @param newCount New count value
     */
    function setCount(uint256 newCount) external onlyOwner whenNotPaused nonReentrant {
        require(newCount >= minCount, "Counter: value below minimum");
        require(maxCount == 0 || newCount <= maxCount, "Counter: value exceeds maximum");
        
        uint256 oldCount = _count;
        _count = newCount;
        _recordCountChange(newCount);
        
        emit CountSet(oldCount, newCount, msg.sender);
    }
    
    /**
     * @dev Reset count to minimum value (owner only)
     */
    function reset() external onlyOwner whenNotPaused nonReentrant {
        _count = minCount;
        _recordCountChange(minCount);
        
        emit CountReset(msg.sender);
    }
    
    /**
     * @dev Batch increment - increment multiple times in one transaction
     * @param times Number of times to increment
     */
    function batchIncrement(uint256 times) external whenNotPaused nonReentrant returns (uint256) {
        require(times > 0, "Counter: times must be greater than 0");
        require(times <= 100, "Counter: batch size too large (max 100)");
        
        uint256 newCount = _count + times;
        require(maxCount == 0 || newCount <= maxCount, "Counter: would exceed maximum");
        
        _count = newCount;
        _recordCountChange(newCount);
        
        emit CountAdded(times, newCount, msg.sender);
        return newCount;
    }
    
    /**
     * @dev Batch decrement - decrement multiple times in one transaction
     * @param times Number of times to decrement
     */
    function batchDecrement(uint256 times) external whenNotPaused nonReentrant returns (uint256) {
        require(times > 0, "Counter: times must be greater than 0");
        require(times <= 100, "Counter: batch size too large (max 100)");
        require(_count >= times, "Counter: underflow");
        
        uint256 newCount = _count - times;
        require(newCount >= minCount, "Counter: would be below minimum");
        
        _count = newCount;
        _recordCountChange(newCount);
        
        emit CountSubtracted(times, newCount, msg.sender);
        return newCount;
    }
    
    /**
     * @dev Get current count
     */
    function count() external view returns (uint256) {
        return _count;
    }
    
    /**
     * @dev Get count history length
     */
    function getHistoryLength() external view returns (uint256) {
        return _countHistory.length;
    }
    
    /**
     * @dev Get count at specific history index
     * @param index History index
     */
    function getCountAtHistoryIndex(uint256 index) external view returns (uint256) {
        require(index < _countHistory.length, "Counter: index out of bounds");
        return _countHistory[index];
    }
    
    /**
     * @dev Get last N count values from history
     * @param n Number of recent values to retrieve
     */
    function getRecentHistory(uint256 n) external view returns (uint256[] memory) {
        uint256 length = _countHistory.length;
        uint256 start = length > n ? length - n : 0;
        uint256 resultLength = length - start;
        
        uint256[] memory result = new uint256[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = _countHistory[start + i];
        }
        return result;
    }
    
    /**
     * @dev Update maximum count (owner only)
     * @param _newMaxCount New maximum count (0 = no limit)
     */
    function setMaxCount(uint256 _newMaxCount) external onlyOwner {
        require(_newMaxCount == 0 || _count <= _newMaxCount, "Counter: current count exceeds new maximum");
        
        uint256 oldMax = maxCount;
        maxCount = _newMaxCount;
        
        emit MaxCountUpdated(oldMax, _newMaxCount);
    }
    
    /**
     * @dev Update minimum count (owner only)
     * @param _newMinCount New minimum count
     */
    function setMinCount(uint256 _newMinCount) external onlyOwner {
        require(_count >= _newMinCount, "Counter: current count below new minimum");
        
        uint256 oldMin = minCount;
        minCount = _newMinCount;
        
        emit MinCountUpdated(oldMin, _newMinCount);
    }
    
    /**
     * @dev Pause contract (owner only) - stops all state-changing functions
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Internal function to record count changes
     */
    function _recordCountChange(uint256 newCount) internal {
        _countHistory.push(newCount);
        countAtTimestamp[block.timestamp] = newCount;
    }
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 current,
        uint256 maximum,
        uint256 minimum,
        uint256 historyLength,
        bool isPaused
    ) {
        return (
            _count,
            maxCount,
            minCount,
            _countHistory.length,
            paused()
        );
    }
}

