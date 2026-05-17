import { describe, expect, it } from "vitest";
import {
    uintCV,
    principalCV,
    boolCV,
    tupleCV,
} from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

const REG = "user-registry";

function register(sender: string) {
    return simnet.callPublicFn(REG, "register-user", [], sender);
}

function getUser(addr: string) {
    return simnet.callReadOnlyFn(REG, "get-user", [principalCV(addr)], addr).result;
}

const initialProfile = tupleCV({
    "is-verified": boolCV(false),
    "total-bookings": uintCV(0),
    "host-rating": uintCV(0),
    "renter-rating": uintCV(0),
    "total-host-reviews": uintCV(0),
    "total-renter-reviews": uintCV(0),
});

describe("user-registry", () => {
    it("registers a fresh user with zeroed profile fields", () => {
        const { result } = register(alice);
        expect(result).toBeOk(boolCV(true));
        expect(getUser(alice)).toBeSome(initialProfile);
    });

    it("rejects a second registration for the same principal", () => {
        register(alice);
        const { result } = register(alice);
        expect(result).toBeErr(uintCV(101)); // err-user-already-exists
    });

    it("returns none for an unknown user", () => {
        expect(getUser(bob)).toBeNone();
    });

    it("lets the contract owner verify a registered user", () => {
        register(alice);
        const { result } = simnet.callPublicFn(
            REG,
            "verify-user",
            [principalCV(alice)],
            deployer,
        );
        expect(result).toBeOk(boolCV(true));

        const verified = simnet.callReadOnlyFn(
            REG,
            "is-user-verified",
            [principalCV(alice)],
            alice,
        ).result;
        expect(verified).toStrictEqual(boolCV(true));
    });

    it("rejects verify-user from a non-owner", () => {
        register(alice);
        const { result } = simnet.callPublicFn(
            REG,
            "verify-user",
            [principalCV(alice)],
            bob,
        );
        expect(result).toBeErr(uintCV(100)); // err-not-authorized
    });

    it("rejects verify-user for an unregistered principal", () => {
        const { result } = simnet.callPublicFn(
            REG,
            "verify-user",
            [principalCV(bob)],
            deployer,
        );
        expect(result).toBeErr(uintCV(102)); // err-user-not-found
    });

    it("increments total-bookings for a registered user", () => {
        register(alice);
        simnet.callPublicFn(REG, "increment-bookings", [principalCV(alice)], deployer);
        simnet.callPublicFn(REG, "increment-bookings", [principalCV(alice)], deployer);

        const user = getUser(alice);
        expect(user).toHaveProperty(
            "value.value.total-bookings",
            uintCV(2),
        );
    });

    it("computes a running average for host rating updates", () => {
        register(alice);
        // first review: rating 5 → average becomes 5 (stored as scaled units)
        simnet.callPublicFn(
            REG,
            "update-rating",
            [principalCV(alice), boolCV(true), uintCV(5)],
            deployer,
        );
        // second review: rating 3 → average becomes (5+3)/2 = 4
        simnet.callPublicFn(
            REG,
            "update-rating",
            [principalCV(alice), boolCV(true), uintCV(3)],
            deployer,
        );

        const user = getUser(alice);
        expect(user).toHaveProperty("value.value.host-rating", uintCV(4));
        expect(user).toHaveProperty("value.value.total-host-reviews", uintCV(2));
    });

    it("tracks host and renter ratings independently", () => {
        register(alice);
        simnet.callPublicFn(
            REG,
            "update-rating",
            [principalCV(alice), boolCV(true), uintCV(5)],
            deployer,
        );
        simnet.callPublicFn(
            REG,
            "update-rating",
            [principalCV(alice), boolCV(false), uintCV(2)],
            deployer,
        );

        const user = getUser(alice);
        expect(user).toHaveProperty("value.value.host-rating", uintCV(5));
        expect(user).toHaveProperty("value.value.renter-rating", uintCV(2));
        expect(user).toHaveProperty("value.value.total-host-reviews", uintCV(1));
        expect(user).toHaveProperty("value.value.total-renter-reviews", uintCV(1));
    });

    it("rejects update-rating for an unregistered principal", () => {
        const { result } = simnet.callPublicFn(
            REG,
            "update-rating",
            [principalCV(bob), boolCV(true), uintCV(5)],
            deployer,
        );
        expect(result).toBeErr(uintCV(102));
    });
});
