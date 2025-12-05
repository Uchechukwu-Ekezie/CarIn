// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ParkingSpot
 * @notice Manages parking spot listings, bookings, and ownership
 * @dev This contract handles spot registration, availability management, and booking creation
 * with time-based locks to prevent double-booking
 */
contract ParkingSpot is Ownable, ReentrancyGuard {
    // Custom errors for gas optimization
    error InvalidPrice();
    error SpotDoesNotExist();
    error SpotNotAvailable();
    error InvalidTimeRange();
    error StartTimeInPast();
    error NotAuthorized();
    error BookingNotActive();
    error CannotCancelActiveBooking();
    error NotSpotOwner();
    error CannotBookOwnSpot();
    error TimeSlotAlreadyBooked();
    error InvalidOwner();

    // Spot structure
    struct Spot {
        uint256 id;
        address owner;
        string location; // IPFS hash for location data
        uint256 pricePerHour; // Price in wei
        bool isAvailable;
        uint256 createdAt;
    }

    // Booking structure
    struct Booking {
        uint256 bookingId;
        uint256 spotId;
        address user;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isCancelled;
    }

    // State variables
    mapping(uint256 => Spot) public spots;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public userBookings;
    mapping(address => uint256[]) public ownerSpots;
    
    uint256 public spotCounter;
    uint256 public bookingCounter;

    // Events
    event SpotListed(uint256 indexed spotId, address indexed owner, uint256 pricePerHour);
    event BookingCreated(uint256 indexed bookingId, uint256 indexed spotId, address indexed user, uint256 startTime, uint256 endTime);
    event BookingCancelled(uint256 indexed bookingId, address indexed user);
    event SpotAvailabilityUpdated(uint256 indexed spotId, bool isAvailable);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev List a new parking spot
     */
    function listSpot(string memory location, uint256 pricePerHour) external returns (uint256) {
        require(pricePerHour > 0, "Price must be greater than 0");
        
        spotCounter++;
        spots[spotCounter] = Spot({
            id: spotCounter,
            owner: msg.sender,
            location: location,
            pricePerHour: pricePerHour,
            isAvailable: true,
            createdAt: block.timestamp
        });

        ownerSpots[msg.sender].push(spotCounter);

        emit SpotListed(spotCounter, msg.sender, pricePerHour);
        return spotCounter;
    }

    /**
     * @dev Create a booking for a parking spot
     */
    function createBooking(uint256 spotId, uint256 startTime, uint256 endTime) external nonReentrant returns (uint256) {
        require(spots[spotId].id != 0, "Spot does not exist");
        require(spots[spotId].isAvailable, "Spot is not available");
        require(startTime < endTime, "Invalid time range");
        require(startTime >= block.timestamp, "Start time must be in the future");

        bookingCounter++;
        bookings[bookingCounter] = Booking({
            bookingId: bookingCounter,
            spotId: spotId,
            user: msg.sender,
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            isCancelled: false
        });

        userBookings[msg.sender].push(bookingCounter);
        spots[spotId].isAvailable = false;

        emit BookingCreated(bookingCounter, spotId, msg.sender, startTime, endTime);
        return bookingCounter;
    }

    /**
     * @dev Cancel a booking
     */
    function cancelBooking(uint256 bookingId) external {
        Booking storage booking = bookings[bookingId];
        require(booking.user == msg.sender || spots[booking.spotId].owner == msg.sender, "Not authorized");
        require(booking.isActive && !booking.isCancelled, "Booking is not active");
        require(block.timestamp < booking.startTime, "Cannot cancel active booking");

        booking.isCancelled = true;
        booking.isActive = false;
        spots[booking.spotId].isAvailable = true;

        emit BookingCancelled(bookingId, msg.sender);
    }

    /**
     * @dev Update spot availability
     */
    function updateSpotAvailability(uint256 spotId, bool isAvailable) external {
        require(spots[spotId].owner == msg.sender, "Not the spot owner");
        spots[spotId].isAvailable = isAvailable;
        emit SpotAvailabilityUpdated(spotId, isAvailable);
    }

    /**
     * @dev Get spot details
     */
    function getSpot(uint256 spotId) external view returns (Spot memory) {
        return spots[spotId];
    }

    /**
     * @dev Get booking details
     */
    function getBooking(uint256 bookingId) external view returns (Booking memory) {
        return bookings[bookingId];
    }
}

