import { describe, expect, it } from "vitest";
import {
    uintCV,
    principalCV,
    stringAsciiCV,
    noneCV,
    someCV,
    bufferCV,
} from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

const TOKEN = "carin-rewards-token";

function mint(amount: number, recipient: string, sender = deployer) {
    return simnet.callPublicFn(
        TOKEN,
        "mint",
        [uintCV(amount), principalCV(recipient)],
        sender,
    );
}

function balance(addr: string) {
    return simnet.callReadOnlyFn(TOKEN, "get-balance", [principalCV(addr)], addr).result;
}

describe("carin-rewards-token (SIP-010)", () => {
    it("exposes the SIP-010 metadata", () => {
        const name = simnet.callReadOnlyFn(TOKEN, "get-name", [], alice).result;
        const symbol = simnet.callReadOnlyFn(TOKEN, "get-symbol", [], alice).result;
        const decimals = simnet.callReadOnlyFn(TOKEN, "get-decimals", [], alice).result;
        const uri = simnet.callReadOnlyFn(TOKEN, "get-token-uri", [], alice).result;

        expect(name).toBeOk(stringAsciiCV("CarIn Rewards Token"));
        expect(symbol).toBeOk(stringAsciiCV("CIRT"));
        expect(decimals).toBeOk(uintCV(6));
        expect(uri).toBeOk(noneCV());
    });

    it("starts every account at zero balance and zero total supply", () => {
        expect(balance(alice)).toBeOk(uintCV(0));
        const supply = simnet.callReadOnlyFn(TOKEN, "get-total-supply", [], alice).result;
        expect(supply).toBeOk(uintCV(0));
    });

    it("lets the contract owner mint and updates balance + supply", () => {
        const { result } = mint(1_000, alice);
        expect(result).toBeOk(expect.anything());

        expect(balance(alice)).toBeOk(uintCV(1_000));
        const supply = simnet.callReadOnlyFn(TOKEN, "get-total-supply", [], alice).result;
        expect(supply).toBeOk(uintCV(1_000));
    });

    it("rejects mint from a non-owner", () => {
        const { result } = mint(500, alice, alice);
        expect(result).toBeErr(uintCV(400)); // err-not-authorized
    });

    it("transfers tokens between accounts when called by the sender", () => {
        mint(1_000, alice);

        const { result } = simnet.callPublicFn(
            TOKEN,
            "transfer",
            [uintCV(300), principalCV(alice), principalCV(bob), noneCV()],
            alice,
        );

        expect(result).toBeOk(expect.anything());
        expect(balance(alice)).toBeOk(uintCV(700));
        expect(balance(bob)).toBeOk(uintCV(300));
    });

    it("rejects transfer when tx-sender is not the named sender", () => {
        mint(1_000, alice);

        const { result } = simnet.callPublicFn(
            TOKEN,
            "transfer",
            [uintCV(100), principalCV(alice), principalCV(bob), noneCV()],
            bob, // bob trying to move alice's tokens
        );

        expect(result).toBeErr(uintCV(400));
        expect(balance(alice)).toBeOk(uintCV(1_000));
        expect(balance(bob)).toBeOk(uintCV(0));
    });

    it("accepts a memo on transfer", () => {
        mint(500, alice);
        const memo = bufferCV(new Uint8Array([0x01, 0x02, 0x03]));

        const { result } = simnet.callPublicFn(
            TOKEN,
            "transfer",
            [uintCV(50), principalCV(alice), principalCV(bob), someCV(memo)],
            alice,
        );

        expect(result).toBeOk(expect.anything());
        expect(balance(bob)).toBeOk(uintCV(50));
    });
});
