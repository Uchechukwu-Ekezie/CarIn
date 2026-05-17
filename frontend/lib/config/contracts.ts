/**
 * Backwards-compatible re-exports.
 *
 * The previous version of this file duplicated network and address
 * config inline. The single source of truth now lives in
 * `lib/contracts/network.ts`. Old imports keep working.
 */

export {
    getCarInNetwork,
    getStacksNetwork,
    getDeployerAddress,
    getContractIdentifier,
    getContractRef,
    CARIN_CONTRACTS,
    type CarInNetwork,
    type CarInContractName,
} from "../contracts/network";

import { getCarInNetwork } from "../contracts/network";

export type NetworkName = "mainnet" | "testnet";

export const NETWORKS = {
    testnet: { name: "Stacks Testnet", chainId: "testnet" },
    mainnet: { name: "Stacks Mainnet", chainId: "mainnet" },
} as const;

export function getNetworkConfig(network: NetworkName = "testnet") {
    return NETWORKS[network];
}

export function isNetworkSupported(chainId: string): boolean {
    return Object.values(NETWORKS).some((n) => n.chainId === chainId);
}

/**
 * Kept for callers that still expect the old shape. Reads from the
 * same env var as the new helpers so a deploy only has to set one
 * variable.
 */
export const DISPUTE_RESOLUTION_ADDRESSES = {
    testnet: getCarInNetwork() === "testnet"
        ? `${process.env.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"}.dispute-resolution`
        : "",
    mainnet: getCarInNetwork() === "mainnet"
        ? `${process.env.NEXT_PUBLIC_STACKS_CONTRACT_ADDRESS || ""}.dispute-resolution`
        : "",
};
