// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./RewardsToken.sol";
import "./ParkingSpot.sol";

/**
 * @title RewardsManager
 * @notice Manages reward distribution for community contributions and accurate reporting
 * @dev Handles:
 *      - Reporting inaccurate spots
 *      - Spot sharing/referral rewards
 *      - Reward claiming with anti-gaming mechanisms
 *      - Oracle integration hooks for verification
 */
contract RewardsManager is Ownable, ReentrancyGuard, Pausable {
    // Reward types enum
    enum RewardType {
        InaccuracyReport,
        SpotShare,
        Referral,
        CommunityContribution
    }

    // Reward claim status
    enum ClaimStatus {
        Pending,
        Approved,
        Rejected,
        Claimed
    }

    // Report structure
    struct Report {
        uint256 reportId;
        uint256 spotId;
        address reporter;
        string reason;
        bytes evidenceHash; // IPFS hash
        uint256 timestamp;
        bool isValid;
        ClaimStatus claimStatus;
        uint256 rewardAmount;
    }

    // Referral structure
    struct Referral {
        address referrer;
        address referee;
        uint256 spotId;
        uint256 timestamp;
        bool isActive;
        uint256 rewardAmount;
        ClaimStatus claimStatus;
    }

    // State variables
    RewardsToken public rewardsToken;
    ParkingSpot public parkingSpot;
    
    mapping(uint256 => Report) public reports;
    mapping(bytes32 => Referral) public referrals; // hash(referrer, referee, spotId) => Referral
    mapping(address => uint256[]) public userReports;
    mapping(address => bytes32[]) public userReferrals;
    mapping(address => mapping(RewardType => uint256)) public pendingRewards;
    mapping(address => uint256) public lastClaimTime;
    
    uint256 public reportCounter;
    
    // Anti-gaming: cooldown periods
    uint256 public reportCooldown = 1 days;
    uint256 public referralCooldown = 7 days;
    uint256 public claimCooldown = 1 days;
    
    // Reward amounts (in wei/tokens)
    uint256 public inaccuracyReportReward = 100 * 10**18; // 100 tokens
    uint256 public spotShareReward = 50 * 10**18; // 50 tokens
    uint256 public referralReward = 25 * 10**18; // 25 tokens
    
    // Oracle address for verification (optional)
    address public oracle;
    
    // Minimum stake for reporting (anti-spam)
    uint256 public minReportStake = 0;
    
    // Events
    event ReportSubmitted(
        uint256 indexed reportId,
        uint256 indexed spotId,
        address indexed reporter,
        string reason
    );
    
    event ReportValidated(
        uint256 indexed reportId,
        bool isValid,
        uint256 rewardAmount
    );
    
    event ReferralCreated(
        bytes32 indexed referralHash,
        address indexed referrer,
        address indexed referee,
        uint256 spotId
    );
    
    event RewardClaimed(
        address indexed user,
        RewardType rewardType,
        uint256 amount,
        uint256 timestamp
    );
    
    event RewardConfigUpdated(
        RewardType rewardType,
        uint256 oldAmount,
        uint256 newAmount
    );
    
    // Modifiers
    modifier onlyOracle() {
        require(msg.sender == oracle || oracle == address(0), "RewardsManager: Only oracle");
        _;
    }
    
    modifier validCooldown(uint256 lastActionTime, uint256 cooldownPeriod) {
        require(
            block.timestamp >= lastActionTime + cooldownPeriod,
            "RewardsManager: Cooldown period not elapsed"
        );
        _;
    }

    /**
     * @notice Constructor
     * @param _rewardsToken Address of RewardsToken contract
     * @param _parkingSpot Address of ParkingSpot contract
     */
    constructor(address _rewardsToken, address _parkingSpot) Ownable(msg.sender) {
        require(_rewardsToken != address(0), "RewardsManager: Invalid token address");
        require(_parkingSpot != address(0), "RewardsManager: Invalid parking spot address");
        
        rewardsToken = RewardsToken(_rewardsToken);
        parkingSpot = ParkingSpot(_parkingSpot);
    }

    /**
     * @notice Submit a report for an inaccurate spot
     * @param spotId The ID of the spot being reported
     * @param reason Reason for the report
     * @param evidenceHash IPFS hash of evidence
     */
    function submitInaccuracyReport(
        uint256 spotId,
        string memory reason,
        bytes memory evidenceHash
    ) external nonReentrant whenNotPaused {
        // Check cooldown
        uint256[] memory userReportsList = userReports[msg.sender];
        if (userReportsList.length > 0) {
            uint256 lastReportId = userReportsList[userReportsList.length - 1];
            Report memory lastReport = reports[lastReportId];
            require(
                block.timestamp >= lastReport.timestamp + reportCooldown,
                "RewardsManager: Report cooldown not elapsed"
            );
        }
        
        // Validate spot exists
        ParkingSpot.Spot memory spot = parkingSpot.getSpot(spotId);
        require(spot.id != 0, "RewardsManager: Invalid spot ID");
        
        reportCounter++;
        reports[reportCounter] = Report({
            reportId: reportCounter,
            spotId: spotId,
            reporter: msg.sender,
            reason: reason,
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            isValid: false,
            claimStatus: ClaimStatus.Pending,
            rewardAmount: 0
        });
        
        userReports[msg.sender].push(reportCounter);
        
        emit ReportSubmitted(reportCounter, spotId, msg.sender, reason);
    }

    /**
     * @notice Validate a report (called by oracle or owner)
     * @param reportId The ID of the report to validate
     * @param isValid Whether the report is valid
     */
    function validateReport(uint256 reportId, bool isValid) external onlyOracle {
        Report storage report = reports[reportId];
        require(report.reportId != 0, "RewardsManager: Report does not exist");
        require(report.claimStatus == ClaimStatus.Pending, "RewardsManager: Report already processed");
        
        report.isValid = isValid;
        
        if (isValid) {
            report.claimStatus = ClaimStatus.Approved;
            report.rewardAmount = inaccuracyReportReward;
            pendingRewards[report.reporter][RewardType.InaccuracyReport] += inaccuracyReportReward;
        } else {
            report.claimStatus = ClaimStatus.Rejected;
        }
        
        emit ReportValidated(reportId, isValid, report.rewardAmount);
    }

    /**
     * @notice Create a referral for spot sharing
     * @param referee The address being referred
     * @param spotId The spot being shared
     */
    function createReferral(address referee, uint256 spotId) external nonReentrant whenNotPaused {
        require(referee != address(0), "RewardsManager: Invalid referee address");
        require(referee != msg.sender, "RewardsManager: Cannot refer yourself");
        ParkingSpot.Spot memory spotCheck = parkingSpot.getSpot(spotId);
        require(spotCheck.id != 0, "RewardsManager: Invalid spot ID");
        
        bytes32 referralHash = keccak256(abi.encodePacked(msg.sender, referee, spotId));
        require(referrals[referralHash].referrer == address(0), "RewardsManager: Referral already exists");
        
        // Check cooldown
        bytes32[] memory userReferralsList = userReferrals[msg.sender];
        if (userReferralsList.length > 0) {
            Referral memory lastReferral = referrals[userReferralsList[userReferralsList.length - 1]];
            require(
                block.timestamp >= lastReferral.timestamp + referralCooldown,
                "RewardsManager: Referral cooldown not elapsed"
            );
        }
        
        referrals[referralHash] = Referral({
            referrer: msg.sender,
            referee: referee,
            spotId: spotId,
            timestamp: block.timestamp,
            isActive: true,
            rewardAmount: referralReward,
            claimStatus: ClaimStatus.Pending
        });
        
        userReferrals[msg.sender].push(referralHash);
        
        emit ReferralCreated(referralHash, msg.sender, referee, spotId);
    }

    /**
     * @notice Activate referral reward after successful booking
     * @param referralHash The hash of the referral
     */
    function activateReferralReward(bytes32 referralHash) external {
        Referral storage referral = referrals[referralHash];
        require(referral.referrer != address(0), "RewardsManager: Referral does not exist");
        require(msg.sender == address(parkingSpot), "RewardsManager: Only ParkingSpot can activate");
        require(referral.claimStatus == ClaimStatus.Pending, "RewardsManager: Referral already processed");
        
        referral.claimStatus = ClaimStatus.Approved;
        pendingRewards[referral.referrer][RewardType.Referral] += referral.rewardAmount;
    }

    /**
     * @notice Claim pending rewards
     * @param rewardType The type of reward to claim
     */
    function claimReward(RewardType rewardType) external nonReentrant whenNotPaused {
        uint256 amount = pendingRewards[msg.sender][rewardType];
        require(amount > 0, "RewardsManager: No pending rewards");
        
        // Check claim cooldown
        require(
            block.timestamp >= lastClaimTime[msg.sender] + claimCooldown,
            "RewardsManager: Claim cooldown not elapsed"
        );
        
        pendingRewards[msg.sender][rewardType] = 0;
        lastClaimTime[msg.sender] = block.timestamp;
        
        rewardsToken.mint(msg.sender, amount, _getRewardTypeString(rewardType));
        
        emit RewardClaimed(msg.sender, rewardType, amount, block.timestamp);
    }

    /**
     * @notice Claim all pending rewards
     */
    function claimAllRewards() external nonReentrant whenNotPaused {
        require(
            block.timestamp >= lastClaimTime[msg.sender] + claimCooldown,
            "RewardsManager: Claim cooldown not elapsed"
        );
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < 4; i++) {
            RewardType rewardType = RewardType(i);
            uint256 amount = pendingRewards[msg.sender][rewardType];
            if (amount > 0) {
                totalAmount += amount;
                pendingRewards[msg.sender][rewardType] = 0;
            }
        }
        
        require(totalAmount > 0, "RewardsManager: No pending rewards");
        
        lastClaimTime[msg.sender] = block.timestamp;
        rewardsToken.mint(msg.sender, totalAmount, "All Rewards");
        
        emit RewardClaimed(msg.sender, RewardType.CommunityContribution, totalAmount, block.timestamp);
    }

    /**
     * @notice Get pending rewards for a user
     * @param user The user address
     * @return totalPending Total pending rewards across all types
     */
    function getPendingRewards(address user) external view returns (uint256 totalPending) {
        for (uint256 i = 0; i < 4; i++) {
            totalPending += pendingRewards[user][RewardType(i)];
        }
    }

    /**
     * @notice Get pending rewards by type
     * @param user The user address
     * @param rewardType The reward type
     * @return amount Pending reward amount
     */
    function getPendingRewardByType(address user, RewardType rewardType) external view returns (uint256) {
        return pendingRewards[user][rewardType];
    }

    // Admin functions
    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }
    
    function setInaccuracyReportReward(uint256 _amount) external onlyOwner {
        uint256 oldAmount = inaccuracyReportReward;
        inaccuracyReportReward = _amount;
        emit RewardConfigUpdated(RewardType.InaccuracyReport, oldAmount, _amount);
    }
    
    function setSpotShareReward(uint256 _amount) external onlyOwner {
        uint256 oldAmount = spotShareReward;
        spotShareReward = _amount;
        emit RewardConfigUpdated(RewardType.SpotShare, oldAmount, _amount);
    }
    
    function setReferralReward(uint256 _amount) external onlyOwner {
        uint256 oldAmount = referralReward;
        referralReward = _amount;
        emit RewardConfigUpdated(RewardType.Referral, oldAmount, _amount);
    }
    
    function setReportCooldown(uint256 _cooldown) external onlyOwner {
        reportCooldown = _cooldown;
    }
    
    function setReferralCooldown(uint256 _cooldown) external onlyOwner {
        referralCooldown = _cooldown;
    }
    
    function setClaimCooldown(uint256 _cooldown) external onlyOwner {
        claimCooldown = _cooldown;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // Internal helper
    function _getRewardTypeString(RewardType rewardType) internal pure returns (string memory) {
        if (rewardType == RewardType.InaccuracyReport) return "Inaccuracy Report";
        if (rewardType == RewardType.SpotShare) return "Spot Share";
        if (rewardType == RewardType.Referral) return "Referral";
        return "Community Contribution";
    }
}

