/**
 * Stacks network configuration and constants
 */

export const NETWORKS = {
  testnet: {
    name: "Stacks Testnet",
    chainId: "testnet",
  },
  mainnet: {
    name: "Stacks Mainnet",
    chainId: "mainnet",
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

export function getNetworkConfig(network: NetworkName = "testnet") {
  return NETWORKS[network];
}

export function isNetworkSupported(chainId: string): boolean {
  return Object.values(NETWORKS).some(network => network.chainId === chainId);
}

export const DISPUTE_RESOLUTION_ADDRESSES = {
  testnet: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS_TESTNET || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dispute-resolution",
  mainnet: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS_MAINNET || "",
};
