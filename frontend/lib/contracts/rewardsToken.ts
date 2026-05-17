/**
 * Typed surface for the `carin-rewards-token` Clarity contract (SIP-010).
 *
 * Note: the previous version of this file claimed the contract
 * name was "carin-token", which is wrong — the Clarinet manifest
 * names it `carin-rewards-token`. The single source of truth now
 * lives in `./network`.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    standardPrincipalCV,
    noneCV,
    someCV,
    bufferCV,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";
import { unwrapResponse } from "./codec";

export interface TokenMetadata {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: bigint;
}

const REF = () => getContractRef("carinRewardsToken");

export async function getBalance(
    address: string,
    senderAddress?: string,
): Promise<bigint> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-balance",
        functionArgs: [standardPrincipalCV(address)],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    return BigInt(unwrapResponse<bigint | number | string>(result));
}

export async function getTotalSupply(senderAddress?: string): Promise<bigint> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-total-supply",
        functionArgs: [],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    return BigInt(unwrapResponse<bigint | number | string>(result));
}

export async function getTokenMetadata(senderAddress?: string): Promise<TokenMetadata> {
    const sender = senderAddress ?? getDeployerAddress();
    const [name, symbol, decimals, totalSupply] = await Promise.all([
        fetchCallReadOnlyFunction({
            ...REF(),
            functionName: "get-name",
            functionArgs: [],
            network: getStacksNetwork(),
            senderAddress: sender,
        }).then((r) => String(unwrapResponse<string>(r))),
        fetchCallReadOnlyFunction({
            ...REF(),
            functionName: "get-symbol",
            functionArgs: [],
            network: getStacksNetwork(),
            senderAddress: sender,
        }).then((r) => String(unwrapResponse<string>(r))),
        fetchCallReadOnlyFunction({
            ...REF(),
            functionName: "get-decimals",
            functionArgs: [],
            network: getStacksNetwork(),
            senderAddress: sender,
        }).then((r) => Number(unwrapResponse<number | bigint>(r))),
        getTotalSupply(sender),
    ]);
    return { name, symbol, decimals, totalSupply };
}

export function buildTransferCall(args: {
    amount: bigint | number | string;
    senderAddress: string;
    recipientAddress: string;
    memo?: Uint8Array; // (optional (buff 34))
}) {
    return {
        ...REF(),
        functionName: "transfer",
        functionArgs: [
            uintCV(BigInt(args.amount)),
            standardPrincipalCV(args.senderAddress),
            standardPrincipalCV(args.recipientAddress),
            args.memo ? someCV(bufferCV(args.memo)) : noneCV(),
        ],
        network: getStacksNetwork(),
    };
}
