import { describe, expect, it } from "vitest";
import { uintCV, principalCV, boolCV } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const payer = accounts.get("wallet_1")!;
const payee = accounts.get("wallet_2")!;
const stranger = accounts.get("wallet_3")!;

const ESCROW = "payment-escrow";

function createEscrow(
    bookingId: number,
    payeeAddr: string,
    amount: number,
    releaseTime: number,
    sender: string,
) {
    return simnet.callPublicFn(
        ESCROW,
        "create-escrow",
        [uintCV(bookingId), principalCV(payeeAddr), uintCV(amount), uintCV(releaseTime)],
        sender,
    );
}

function getStxBalance(addr: string): bigint {
    return simnet.getAssetsMap().get("STX")?.get(addr) ?? 0n;
}

describe("payment-escrow", () => {
    it("creates an escrow and locks the payer's STX", () => {
        const startBal = getStxBalance(payer);
        const { result } = createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 10, payer);

        expect(result).toBeOk(uintCV(1));
        expect(getStxBalance(payer)).toBe(startBal - 1_000n);
    });

    it("rejects an escrow with zero amount", () => {
        const { result } = createEscrow(1, payee, 0, simnet.burnBlockHeight + 10, payer);
        expect(result).toBeErr(uintCV(204)); // err-amount-mismatch
    });

    it("refuses to release funds before the release time", () => {
        createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 100, payer);

        const { result } = simnet.callPublicFn(
            ESCROW,
            "release-funds",
            [uintCV(1)],
            payee,
        );
        expect(result).toBeErr(uintCV(203)); // err-release-time-not-reached
    });

    it("releases funds to the payee once the release time has passed", () => {
        createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 2, payer);
        simnet.mineEmptyBurnBlocks(3);

        const payeeBefore = getStxBalance(payee);
        const { result } = simnet.callPublicFn(
            ESCROW,
            "release-funds",
            [uintCV(1)],
            payee,
        );

        expect(result).toBeOk(boolCV(true));
        expect(getStxBalance(payee)).toBe(payeeBefore + 1_000n);
    });

    it("rejects release from a non-payee non-owner caller", () => {
        createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 2, payer);
        simnet.mineEmptyBurnBlocks(3);

        const { result } = simnet.callPublicFn(
            ESCROW,
            "release-funds",
            [uintCV(1)],
            stranger,
        );
        expect(result).toBeErr(uintCV(200)); // err-not-authorized
    });

    it("refunds the payer on refund-payer and reports err-escrow-not-pending afterwards", () => {
        createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 10, payer);

        const payerBefore = getStxBalance(payer);
        const refund = simnet.callPublicFn(ESCROW, "refund-payer", [uintCV(1)], payer);

        expect(refund.result).toBeOk(boolCV(true));
        expect(getStxBalance(payer)).toBe(payerBefore + 1_000n);

        // Second refund attempt should fail because status is no longer pending.
        const second = simnet.callPublicFn(ESCROW, "refund-payer", [uintCV(1)], payer);
        expect(second.result).toBeErr(uintCV(202)); // err-escrow-not-pending
    });

    it("returns err-escrow-not-found for an unknown escrow id", () => {
        const { result } = simnet.callPublicFn(ESCROW, "release-funds", [uintCV(999)], payee);
        expect(result).toBeErr(uintCV(201));
    });

    it("lets the contract owner resolve a dispute by refunding the payer", () => {
        createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 10, payer);
        simnet.callPublicFn(ESCROW, "mark-disputed", [uintCV(1)], deployer);

        const payerBefore = getStxBalance(payer);
        const { result } = simnet.callPublicFn(
            ESCROW,
            "resolve-dispute",
            [uintCV(1), boolCV(true)],
            deployer,
        );

        expect(result).toBeOk(boolCV(true));
        expect(getStxBalance(payer)).toBe(payerBefore + 1_000n);
    });

    it("lets the contract owner resolve a dispute by releasing to the payee", () => {
        createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 10, payer);
        simnet.callPublicFn(ESCROW, "mark-disputed", [uintCV(1)], deployer);

        const payeeBefore = getStxBalance(payee);
        const { result } = simnet.callPublicFn(
            ESCROW,
            "resolve-dispute",
            [uintCV(1), boolCV(false)],
            deployer,
        );

        expect(result).toBeOk(boolCV(true));
        expect(getStxBalance(payee)).toBe(payeeBefore + 1_000n);
    });

    it("rejects resolve-dispute from a non-owner", () => {
        createEscrow(1, payee, 1_000, simnet.burnBlockHeight + 10, payer);
        simnet.callPublicFn(ESCROW, "mark-disputed", [uintCV(1)], deployer);

        const { result } = simnet.callPublicFn(
            ESCROW,
            "resolve-dispute",
            [uintCV(1), boolCV(true)],
            stranger,
        );
        expect(result).toBeErr(uintCV(200));
    });
});
