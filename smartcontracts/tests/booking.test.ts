import { describe, expect, it } from "vitest";
import {
    uintCV,
    stringUtf8CV,
    stringAsciiCV,
    boolCV,
} from "@stacks/transactions";

const accounts = simnet.getAccounts();
const owner = accounts.get("wallet_1")!;
const renter = accounts.get("wallet_2")!;
const stranger = accounts.get("wallet_3")!;

const BOOKING = "booking";
const SPOT = "parking-spot";
const REG = "user-registry";
const CARS = "car-registry";

// Each test must run setup itself: when this scaffold lives in a
// vitest beforeEach hook it interleaves badly with the global
// before-each from @stacks/clarinet-sdk and the spot ends up
// missing by the time the test body runs. Inline setup is the
// pattern the rest of the suite uses.
function setup() {
    simnet.callPublicFn(REG, "register-user", [], owner);
    simnet.callPublicFn(REG, "register-user", [], renter);
    simnet.callPublicFn(
        CARS,
        "register-car",
        [stringAsciiCV("ABC-1"), stringAsciiCV("Make"), stringAsciiCV("Model"), uintCV(2020)],
        renter,
    );
    simnet.callPublicFn(
        SPOT,
        "list-spot",
        [stringUtf8CV("123 Main St"), uintCV(10)],
        owner,
    );
}

function createBooking(spotId: number, carId: number, start: number, end: number, sender = renter) {
    return simnet.callPublicFn(
        BOOKING,
        "create-booking",
        [uintCV(spotId), uintCV(carId), uintCV(start), uintCV(end)],
        sender,
    );
}

function stxBalance(addr: string): bigint {
    return simnet.getAssetsMap().get("STX")?.get(addr) ?? 0n;
}

describe("booking", () => {
    it("creates a booking, stores it, and registers it under the spot", () => {
        setup();
        const start = simnet.burnBlockHeight + 5;
        const end = start + 4; // 4 blocks × 10 STX/block = 40 STX escrow

        const { result } = createBooking(1, 1, start, end);
        expect(result).toBeOk(uintCV(1));

        const booking = simnet.callReadOnlyFn(BOOKING, "get-booking", [uintCV(1)], renter).result;
        expect(booking).toHaveProperty("value.value.status", uintCV(0));
        expect(booking).toHaveProperty("value.value.total-price", uintCV(40));
        expect(booking).toHaveProperty("value.value.escrow-id", uintCV(1));
    });

    it("rejects a booking with start >= end", () => {
        setup();
        const { result } = createBooking(1, 1, 10, 10);
        expect(result).toBeErr(uintCV(103)); // err-invalid-time-range
    });

    it("rejects a booking that starts in the past", () => {
        setup();
        const { result } = createBooking(1, 1, 1, 5);
        expect(result).toBeErr(uintCV(104)); // err-start-time-in-past
    });

    it("rejects an owner trying to book their own spot", () => {
        setup();
        const start = simnet.burnBlockHeight + 5;
        const { result } = createBooking(1, 1, start, start + 2, owner);
        expect(result).toBeErr(uintCV(105)); // err-cannot-book-own-spot
    });

    it("rejects a booking that overlaps an existing one", () => {
        setup();
        const start = simnet.burnBlockHeight + 5;
        createBooking(1, 1, start, start + 4);

        const { result } = createBooking(1, 1, start + 1, start + 3);
        expect(result).toBeErr(uintCV(106)); // err-time-slot-already-booked
    });

    it("rejects a booking when the spot has been marked unavailable", () => {
        setup();
        simnet.callPublicFn(SPOT, "update-spot-availability", [uintCV(1), boolCV(false)], owner);

        const start = simnet.burnBlockHeight + 5;
        const { result } = createBooking(1, 1, start, start + 2);
        expect(result).toBeErr(uintCV(102)); // err-spot-not-available
    });

    it("rejects a booking against a spot that does not exist", () => {
        setup();
        const start = simnet.burnBlockHeight + 5;
        const { result } = createBooking(999, 1, start, start + 2);
        expect(result).toBeErr(uintCV(101)); // err-spot-not-found
    });

    it("lets the renter cancel before the booking starts and refunds the escrow", () => {
        setup();
        const start = simnet.burnBlockHeight + 20;
        createBooking(1, 1, start, start + 4);

        const renterBefore = stxBalance(renter);
        const { result } = simnet.callPublicFn(BOOKING, "cancel-booking", [uintCV(1)], renter);
        expect(result).toBeOk(boolCV(true));
        expect(stxBalance(renter) - renterBefore).toBe(40n);
    });

    it("rejects cancel-booking from a stranger", () => {
        setup();
        const start = simnet.burnBlockHeight + 20;
        createBooking(1, 1, start, start + 4);

        const { result } = simnet.callPublicFn(BOOKING, "cancel-booking", [uintCV(1)], stranger);
        expect(result).toBeErr(uintCV(100)); // err-not-authorized
    });

    it("releases escrowed funds to the owner on complete-booking after end time", () => {
        setup();
        const start = simnet.burnBlockHeight + 2;
        const end = start + 4;
        createBooking(1, 1, start, end);

        // Advance past end-time so release-funds' release-time check passes.
        simnet.mineEmptyBurnBlocks(end + 5);

        const ownerBefore = stxBalance(owner);
        // Must be called by the owner: the inner payment-escrow.release-funds
        // restricts tx-sender to the payee or the contract-owner. The booking
        // contract's own gate on complete-booking is looser (renter OR owner),
        // but the underlying escrow rejects renter callers.
        const { result } = simnet.callPublicFn(BOOKING, "complete-booking", [uintCV(1)], owner);
        expect(result).toBeOk(boolCV(true));
        expect(stxBalance(owner) - ownerBefore).toBe(40n);
    });

    it("BUG: complete-booking by the renter fails at the escrow release step", () => {
        // booking.clar lets either the renter or the owner call complete-
        // booking, but payment-escrow.release-funds only accepts the payee
        // (the owner) or the deployer. So a renter calling complete-booking
        // hits err-not-authorized (u200) from the inner contract-call.
        // Fixing this means either tightening complete-booking to owner-only
        // or wrapping the inner release-funds in `as-contract`.
        setup();
        const start = simnet.burnBlockHeight + 2;
        const end = start + 4;
        createBooking(1, 1, start, end);
        simnet.mineEmptyBurnBlocks(end + 5);

        const { result } = simnet.callPublicFn(BOOKING, "complete-booking", [uintCV(1)], renter);
        expect(result).toBeErr(uintCV(200));
    });
});
