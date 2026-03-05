const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow", function () {
  let PaymentEscrow;
  let paymentEscrow;
  let owner;
  let payer;
  let payee;
  let cUSDToken;
  let cEURToken;

  beforeEach(async function () {
    [owner, payer, payee] = await ethers.getSigners();
    
    // Deploy mock ERC20 tokens for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cUSDToken = await MockERC20.deploy("Celo Dollar", "cUSD", 18);
    cEURToken = await MockERC20.deploy("Celo Euro", "cEUR", 18);

    PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    paymentEscrow = await PaymentEscrow.deploy(
      await cUSDToken.getAddress(),
      await cEURToken.getAddress()
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await paymentEscrow.owner()).to.equal(owner.address);
    });

    it("Should set token addresses correctly", async function () {
      expect(await paymentEscrow.cUSDToken()).to.equal(await cUSDToken.getAddress());
      expect(await paymentEscrow.cEURToken()).to.equal(await cEURToken.getAddress());
    });
  });

  describe("Creating Escrow", function () {
    it("Should create escrow with native CELO", async function () {
      const bookingId = 1;
      const releaseTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const amount = ethers.parseEther("1.0");

      await expect(
        paymentEscrow.connect(payer).createEscrow(
          bookingId,
          payee.address,
          releaseTime,
          0, // Use default expiration
          { value: amount }
        )
      ).to.emit(paymentEscrow, "EscrowCreated");

      const escrow = await paymentEscrow.getEscrow(1);
      expect(escrow.bookingId).to.equal(bookingId);
      expect(escrow.payer).to.equal(payer.address);
      expect(escrow.payee).to.equal(payee.address);
      expect(escrow.amount).to.equal(amount);
    });
  });
});
