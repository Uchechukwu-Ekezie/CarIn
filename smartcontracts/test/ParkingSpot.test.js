const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ParkingSpot", function () {
  let ParkingSpot;
  let parkingSpot;
  let owner;
  let spotOwner;
  let renter;

  beforeEach(async function () {
    [owner, spotOwner, renter] = await ethers.getSigners();
    
    ParkingSpot = await ethers.getContractFactory("ParkingSpot");
    parkingSpot = await ParkingSpot.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await parkingSpot.owner()).to.equal(owner.address);
    });
  });

  describe("Spot Listing", function () {
    it("Should allow listing a new parking spot", async function () {
      const location = "123 Main St, City";
      const pricePerHour = ethers.parseEther("1");
      
      const tx = await parkingSpot.connect(spotOwner).listSpot(location, pricePerHour);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(parkingSpot, "SpotListed")
        .withArgs(1, spotOwner.address, location, pricePerHour, block.timestamp);
      
      const spot = await parkingSpot.getSpot(1);
      expect(spot.id).to.equal(1);
      expect(spot.owner).to.equal(spotOwner.address);
      expect(spot.location).to.equal(location);
      expect(spot.pricePerHour).to.equal(pricePerHour);
      expect(spot.isAvailable).to.be.true;
    });

    it("Should revert when listing with zero price", async function () {
      await expect(
        parkingSpot.connect(spotOwner).listSpot("Location", 0)
      ).to.be.revertedWithCustomError(parkingSpot, "InvalidPrice");
    });

    it("Should increment spot counter", async function () {
      await parkingSpot.connect(spotOwner).listSpot("Location 1", ethers.parseEther("1"));
      await parkingSpot.connect(spotOwner).listSpot("Location 2", ethers.parseEther("2"));
      
      expect(await parkingSpot.spotCounter()).to.equal(2);
    });

    it("Should track owner spots", async function () {
      await parkingSpot.connect(spotOwner).listSpot("Location 1", ethers.parseEther("1"));
      await parkingSpot.connect(spotOwner).listSpot("Location 2", ethers.parseEther("2"));
      
      const ownerSpots = await parkingSpot.getOwnerSpots(spotOwner.address);
      expect(ownerSpots.length).to.equal(2);
      expect(ownerSpots[0]).to.equal(1);
      expect(ownerSpots[1]).to.equal(2);
    });
  });

  describe("Booking Creation", function () {
    let spotId;
    let futureStartTime;
    let futureEndTime;

    beforeEach(async function () {
      spotId = 1;
      await parkingSpot.connect(spotOwner).listSpot("123 Main St", ethers.parseEther("1"));
      
      const block = await ethers.provider.getBlock("latest");
      futureStartTime = block.timestamp + 3600; // 1 hour from now
      futureEndTime = futureStartTime + 7200; // 2 hours later
    });

    it("Should create a booking successfully", async function () {
      const tx = await parkingSpot.connect(renter).createBooking(spotId, futureStartTime, futureEndTime);
      const receipt = await tx.wait();
      const booking = await parkingSpot.getBooking(1);
      
      await expect(tx)
        .to.emit(parkingSpot, "BookingCreated")
        .withArgs(1, spotId, renter.address, futureStartTime, futureEndTime, booking.totalPrice);
      
      const booking = await parkingSpot.getBooking(1);
      expect(booking.spotId).to.equal(spotId);
      expect(booking.user).to.equal(renter.address);
      expect(booking.startTime).to.equal(futureStartTime);
      expect(booking.endTime).to.equal(futureEndTime);
      expect(booking.isActive).to.be.true;
    });

    it("Should calculate total price correctly", async function () {
      const tx = await parkingSpot.connect(renter).createBooking(spotId, futureStartTime, futureEndTime);
      await tx.wait();
      
      const booking = await parkingSpot.getBooking(1);
      const duration = futureEndTime - futureStartTime;
      const expectedPrice = (duration * ethers.parseEther("1")) / 3600n;
      expect(booking.totalPrice).to.equal(expectedPrice);
    });

    it("Should revert when booking non-existent spot", async function () {
      await expect(
        parkingSpot.connect(renter).createBooking(999, futureStartTime, futureEndTime)
      ).to.be.revertedWithCustomError(parkingSpot, "SpotDoesNotExist");
    });

    it("Should revert when booking own spot", async function () {
      await expect(
        parkingSpot.connect(spotOwner).createBooking(spotId, futureStartTime, futureEndTime)
      ).to.be.revertedWithCustomError(parkingSpot, "CannotBookOwnSpot");
    });

    it("Should revert when start time is in the past", async function () {
      const pastTime = (await ethers.provider.getBlock("latest")).timestamp - 100;
      await expect(
        parkingSpot.connect(renter).createBooking(spotId, pastTime, futureEndTime)
      ).to.be.revertedWithCustomError(parkingSpot, "StartTimeInPast");
    });
  });

  describe("Time-Based Booking Locks", function () {
    let spotId;
    let futureStartTime;
    let futureEndTime;

    beforeEach(async function () {
      spotId = 1;
      await parkingSpot.connect(spotOwner).listSpot("123 Main St", ethers.parseEther("1"));
      
      const block = await ethers.provider.getBlock("latest");
      futureStartTime = block.timestamp + 3600;
      futureEndTime = futureStartTime + 7200;
    });

    it("Should prevent double-booking for overlapping time slots", async function () {
      await parkingSpot.connect(renter).createBooking(spotId, futureStartTime, futureEndTime);
      
      // Try to book overlapping time
      const overlappingStart = futureStartTime + 1800; // 30 min after first booking starts
      const overlappingEnd = futureEndTime + 1800; // 30 min after first booking ends
      
      await expect(
        parkingSpot.connect(renter).createBooking(spotId, overlappingStart, overlappingEnd)
      ).to.be.revertedWithCustomError(parkingSpot, "TimeSlotAlreadyBooked");
    });

    it("Should allow non-overlapping bookings", async function () {
      await parkingSpot.connect(renter).createBooking(spotId, futureStartTime, futureEndTime);
      
      // Book a time slot after the first one ends
      const nextStart = futureEndTime + 100;
      const nextEnd = nextStart + 3600;
      
      await expect(
        parkingSpot.connect(renter).createBooking(spotId, nextStart, nextEnd)
      ).to.emit(parkingSpot, "BookingCreated");
    });

    it("Should check time slot availability correctly", async function () {
      await parkingSpot.connect(renter).createBooking(spotId, futureStartTime, futureEndTime);
      
      const isAvailable = await parkingSpot.isTimeSlotAvailable(spotId, futureStartTime, futureEndTime);
      expect(isAvailable).to.be.false;
      
      // Check availability for a future non-overlapping slot
      const futureSlotStart = futureEndTime + 1000;
      const futureSlotEnd = futureSlotStart + 3600;
      const isAvailableFuture = await parkingSpot.isTimeSlotAvailable(spotId, futureSlotStart, futureSlotEnd);
      expect(isAvailableFuture).to.be.true;
    });
  });

  // More tests will be added in subsequent commits
});

