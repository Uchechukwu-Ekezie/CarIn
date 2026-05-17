import { describe, expect, it } from "vitest";
import { stringUtf8CV, uintCV, principalCV, boolCV, tupleCV } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

function listSpot(location: string, price: number, sender: string) {
    return simnet.callPublicFn(
        "parking-spot",
        "list-spot",
        [stringUtf8CV(location), uintCV(price)],
        sender,
    );
}

function getSpot(id: number) {
    return simnet.callReadOnlyFn("parking-spot", "get-spot", [uintCV(id)], wallet1).result;
}

describe("parking-spot", () => {
    it("allows a user to list a parking spot", () => {
        const listedAt = simnet.burnBlockHeight;
        const { result } = listSpot("123 Main St", 100, wallet1);

        expect(result).toBeOk(uintCV(1));
        expect(getSpot(1)).toBeSome(tupleCV({
            "owner": principalCV(wallet1),
            "location": stringUtf8CV("123 Main St"),
            "price-per-hour": uintCV(100),
            "is-available": boolCV(true),
            "created-at": uintCV(listedAt),
        }));
    });

    it("allows the owner to update spot availability", () => {
        const listedAt = simnet.burnBlockHeight;
        listSpot("123 Main St", 100, wallet1);

        const { result } = simnet.callPublicFn(
            "parking-spot",
            "update-spot-availability",
            [uintCV(1), boolCV(false)],
            wallet1,
        );

        expect(result).toBeOk(boolCV(true));
        expect(getSpot(1)).toBeSome(tupleCV({
            "owner": principalCV(wallet1),
            "location": stringUtf8CV("123 Main St"),
            "price-per-hour": uintCV(100),
            "is-available": boolCV(false),
            "created-at": uintCV(listedAt),
        }));
    });

    it("prevents non-owners from updating availability", () => {
        listSpot("123 Main St", 100, wallet1);

        const { result } = simnet.callPublicFn(
            "parking-spot",
            "update-spot-availability",
            [uintCV(1), boolCV(false)],
            wallet2,
        );

        expect(result).toBeErr(uintCV(100)); // err-not-owner
    });
});
