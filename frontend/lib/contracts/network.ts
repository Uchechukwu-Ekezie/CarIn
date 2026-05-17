/**
 * Single source of truth for which Stacks network we talk to and
 * where the CarIn contracts live on it.
 *
 * The deployer address comes from `NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS`.
 * Set this when you deploy. If unset, we fall back to the standard
 * Clarinet simnet deployer address (ST1PQH…), which is only useful
 * for local dev — read-only calls against testnet/mainnet will fail
 * loudly if the env var isn't set, which is the desired behaviour.
 *
 * Network selection is driven by `NEXT_PUBLIC_STACKS_NETWORK`
 * (`mainnet` | `testnet` | `devnet`). The previous
 * `NEXT_PUBLIC_NETWORK` name is also accepted for backwards
 * compatibility with the older constants/contracts.ts.
 */

import {
    STACKS_MAINNET,
    STACKS_TESTNET,
    STACKS_DEVNET,
    type StacksNetwork,
} from "@stacks/network";

export type CarInNetwork = "mainnet" | "testnet" | "devnet";

const FALLBACK_DEPLOYER_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export function getCarInNetwork(): CarInNetwork {
    const raw =
        process.env.NEXT_PUBLIC_STACKS_NETWORK ||
        process.env.NEXT_PUBLIC_NETWORK ||
        "testnet";
    if (raw === "mainnet" || raw === "testnet" || raw === "devnet") return raw;
    return "testnet";
}

export function getStacksNetwork(): StacksNetwork {
    switch (getCarInNetwork()) {
        case "mainnet":
            return STACKS_MAINNET;
        case "devnet":
            return STACKS_DEVNET;
        case "testnet":
        default:
            return STACKS_TESTNET;
    }
}

export function getDeployerAddress(): string {
    return (
        process.env.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS ||
        FALLBACK_DEPLOYER_ADDRESS
    );
}

export const CARIN_CONTRACTS = {
    parkingSpot: "parking-spot",
    booking: "booking",
    paymentEscrow: "payment-escrow",
    disputeResolution: "dispute-resolution",
    spotReviews: "spot-reviews",
    userRegistry: "user-registry",
    carRegistry: "car-registry",
    carinRewardsToken: "carin-rewards-token",
    rewardsManager: "rewards-manager",
} as const;

export type CarInContractName = keyof typeof CARIN_CONTRACTS;

/**
 * Build the fully-qualified identifier (deployer.contract-name) for a
 * given contract. Useful for logs, links, and any API that wants a
 * single string.
 */
export function getContractIdentifier(contract: CarInContractName): string {
    return `${getDeployerAddress()}.${CARIN_CONTRACTS[contract]}`;
}

/**
 * Split form ({ address, name }) used by `fetchCallReadOnlyFunction`
 * and `openContractCall` from @stacks/transactions / @stacks/connect.
 */
export function getContractRef(contract: CarInContractName) {
    return {
        contractAddress: getDeployerAddress(),
        contractName: CARIN_CONTRACTS[contract],
    };
}
