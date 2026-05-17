import { describe, expect, it } from "vitest";
import {
    uintCV,
    principalCV,
    stringUtf8CV,
    stringAsciiCV,
    boolCV,
} from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const payer = accounts.get("wallet_1")!;
const payee = accounts.get("wallet_2")!;
const stranger = accounts.get("wallet_3")!;

const DISPUTES = "dispute-resolution";
const ESCROW = "payment-escrow";

function seedEscrow(amount = 1_000) {
    return simnet.callPublicFn(
        ESCROW,
        "create-escrow",
        [
            uintCV(1),
            principalCV(payee),
            uintCV(amount),
            uintCV(simnet.burnBlockHeight + 100),
        ],
        payer,
    );
}

function fileDispute(escrowId = 1, opposing = payee, sender = payer) {
    return simnet.callPublicFn(
        DISPUTES,
        "file-dispute",
        [
            uintCV(escrowId),
            uintCV(1),
            principalCV(opposing),
            stringUtf8CV("spot was inaccessible"),
        ],
        sender,
    );
}

describe("dispute-resolution", () => {
    it("files a dispute and locks the underlying escrow", () => {
        seedEscrow();
        const { result } = fileDispute();
        expect(result).toBeOk(uintCV(1));

        // Status on the escrow should now be status-disputed (u3),
        // so refund-payer must fail with err-escrow-not-pending (u202).
        const refund = simnet.callPublicFn(ESCROW, "refund-payer", [uintCV(1)], payer);
        expect(refund.result).toBeErr(uintCV(202));
    });

    it("lets either party add evidence", () => {
        seedEscrow();
        fileDispute();

        const filerEv = simnet.callPublicFn(
            DISPUTES,
            "add-evidence",
            [uintCV(1), stringAsciiCV("0xabc123")],
            payer,
        );
        const opposingEv = simnet.callPublicFn(
            DISPUTES,
            "add-evidence",
            [uintCV(1), stringAsciiCV("0xdef456")],
            payee,
        );

        expect(filerEv.result).toBeOk(uintCV(1));
        expect(opposingEv.result).toBeOk(uintCV(2));
    });

    it("rejects evidence from an unrelated principal", () => {
        seedEscrow();
        fileDispute();

        const { result } = simnet.callPublicFn(
            DISPUTES,
            "add-evidence",
            [uintCV(1), stringAsciiCV("0xfeed")],
            stranger,
        );
        expect(result).toBeErr(uintCV(300)); // err-not-authorized
    });

    it("rejects add-evidence for an unknown dispute id", () => {
        const { result } = simnet.callPublicFn(
            DISPUTES,
            "add-evidence",
            [uintCV(999), stringAsciiCV("0x00")],
            payer,
        );
        expect(result).toBeErr(uintCV(301)); // err-dispute-not-found
    });

    it("lets the contract owner resolve the dispute in favour of the payer", () => {
        seedEscrow(1_000);
        fileDispute();

        const payerBefore =
            simnet.getAssetsMap().get("STX")?.get(payer) ?? 0n;

        const { result } = simnet.callPublicFn(
            DISPUTES,
            "resolve-dispute",
            [uintCV(1), boolCV(true)],
            deployer,
        );
        expect(result).toBeOk(boolCV(true));

        const payerAfter =
            simnet.getAssetsMap().get("STX")?.get(payer) ?? 0n;
        expect(payerAfter - payerBefore).toBe(1_000n);
    });

    it("rejects resolve-dispute from a non-owner", () => {
        seedEscrow();
        fileDispute();

        const { result } = simnet.callPublicFn(
            DISPUTES,
            "resolve-dispute",
            [uintCV(1), boolCV(true)],
            stranger,
        );
        expect(result).toBeErr(uintCV(300));
    });

    it("rejects a second resolve-dispute on the same dispute", () => {
        seedEscrow();
        fileDispute();

        simnet.callPublicFn(
            DISPUTES,
            "resolve-dispute",
            [uintCV(1), boolCV(true)],
            deployer,
        );

        const second = simnet.callPublicFn(
            DISPUTES,
            "resolve-dispute",
            [uintCV(1), boolCV(true)],
            deployer,
        );
        expect(second.result).toBeErr(uintCV(302)); // err-dispute-already-resolved
    });

    it("rejects add-evidence on a resolved dispute", () => {
        seedEscrow();
        fileDispute();
        simnet.callPublicFn(
            DISPUTES,
            "resolve-dispute",
            [uintCV(1), boolCV(false)],
            deployer,
        );

        const { result } = simnet.callPublicFn(
            DISPUTES,
            "add-evidence",
            [uintCV(1), stringAsciiCV("late")],
            payer,
        );
        expect(result).toBeErr(uintCV(302));
    });
});
