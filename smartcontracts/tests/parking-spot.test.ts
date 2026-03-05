import { describe, expect, it } from "vitest";
import { stringUtf8CV, uintCV, principalCV, boolCV, tupleCV } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("parking-spot", () => {
    it("allows a user to list a parking spot", () => {
        const { result } = simnet.callPublicFn(
            "parking-spot",
            "list-spot",
            [
                stringUtf8CV("123 Main St"),
                uintCV(100)
            ],
            wallet1
        );

        expect(result).toBeOk(uintCV(1));

        const spotDetails = simnet.callReadOnlyFn(
            "parking-spot",
            "get-spot",
            [uintCV(1)],
            wallet1
        );
        expect(spotDetails.result).toBeSome(tupleCV({
            "owner": principalCV(wallet1),
            "location": stringUtf8CV("123 Main St"),
            "price-per-hour": uintCV(100),
            "is-available": boolCV(true),
            "created-at": uintCV(0)
        }));
    });

    it("allows a user to toggle spot availability", () => {
        // First list a spot
        simnet.callPublicFn(
            "parking-spot",
            "list-spot",
            [
                stringUtf8CV("123 Main St"),
                uintCV(100)
            ],
            wallet1
        );

        // Toggle availability
        const { result } = simnet.callPublicFn(
            "parking-spot",
            "toggle-availability",
            [uintCV(1), boolCV(false)],
            wallet1
        );

        expect(result).toBeOk(boolCV(true));

        const spotDetails = simnet.callReadOnlyFn(
            "parking-spot",
            "get-spot",
            [uintCV(1)],
            wallet1
        );
        // We know it drops to SOME data map. Just using string parsing for simplicity
        expect(spotDetails.result).toHaveProperty('value.data.is-available', boolCV(false));
    });

    it("prevents non-owners from toggling availability", () => {
        // First list a spot with wallet1
        simnet.callPublicFn(
            "parking-spot",
            "list-spot",
            [
                stringUtf8CV("123 Main St"),
                uintCV(100)
            ],
            wallet1
        );

        // Try to toggle availability with wallet2
        const { result } = simnet.callPublicFn(
            "parking-spot",
            "toggle-availability",
            [uintCV(1), boolCV(false)],
            wallet2
        );

        expect(result).toBeErr(uintCV(100)); // err-not-authorized
    });
});
