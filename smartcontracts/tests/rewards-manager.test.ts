import { describe, expect, it } from "vitest";
import { uintCV, principalCV } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const stranger = accounts.get("wallet_2")!;

const MANAGER = "rewards-manager";
const TOKEN = "carin-rewards-token";

function addReward(user: string, amount: number, sender = deployer) {
    return simnet.callPublicFn(
        MANAGER,
        "add-reward",
        [principalCV(user), uintCV(amount)],
        sender,
    );
}

function pending(user: string) {
    return simnet.callReadOnlyFn(
        MANAGER,
        "get-pending-rewards",
        [principalCV(user)],
        deployer,
    ).result;
}

describe("rewards-manager", () => {
    it("lets the owner add pending rewards for a user", () => {
        const { result } = addReward(alice, 100);
        expect(result).toBeOk(expect.anything());
        expect(pending(alice)).toBeUint(100);
    });

    it("accumulates pending rewards across multiple add-reward calls", () => {
        addReward(alice, 100);
        addReward(alice, 250);
        expect(pending(alice)).toBeUint(350);
    });

    it("rejects add-reward from a non-owner", () => {
        const { result } = addReward(alice, 100, stranger);
        expect(result).toBeErr(uintCV(500)); // err-not-authorized
    });

    it("returns 0 pending for a user that was never rewarded", () => {
        expect(pending(stranger)).toBeUint(0);
    });

    it("rejects claim-rewards when the user has no pending balance", () => {
        const { result } = simnet.callPublicFn(MANAGER, "claim-rewards", [], stranger);
        expect(result).toBeErr(uintCV(501)); // err-no-pending-rewards
    });

    it("lets the deployer claim their own pending rewards", () => {
        // The deployer is both rewards-manager owner AND token owner, so the
        // mint inside claim-rewards succeeds. This is the only currently
        // working claim path — see the next test for the bug it exposes.
        addReward(deployer, 500);

        const { result } = simnet.callPublicFn(MANAGER, "claim-rewards", [], deployer);
        expect(result).toBeOk(uintCV(500));

        // pending is reset to 0 after a successful claim
        expect(pending(deployer)).toBeUint(0);

        // and the deployer was minted 500 tokens
        const bal = simnet.callReadOnlyFn(
            TOKEN,
            "get-balance",
            [principalCV(deployer)],
            deployer,
        ).result;
        expect(bal).toBeOk(uintCV(500));
    });

    it("BUG: claim-rewards by a non-deployer user currently fails at the token mint step", () => {
        // The token contract restricts mint to tx-sender == contract-owner,
        // and tx-sender is preserved across the contract-call from
        // rewards-manager. So a non-deployer user with pending rewards hits
        // err-not-authorized (u400) coming from the token contract instead
        // of receiving their tokens. The fix is either to wrap the mint in
        // `as-contract` here or to whitelist .rewards-manager as a minter in
        // the token contract. This test documents the broken behaviour so a
        // future fix has an obvious assertion to flip.
        addReward(alice, 200);

        const { result } = simnet.callPublicFn(MANAGER, "claim-rewards", [], alice);
        expect(result).toBeErr(uintCV(400));
    });
});
