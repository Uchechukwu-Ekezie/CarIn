/**
 * RewardsToken Contract Interface for Stacks (SIP-010)
 */

export const REWARDS_TOKEN_CONTRACT = "carin-token";

export const REWARDS_TOKEN_ADDRESSES = {
  testnet: process.env.NEXT_PUBLIC_STACKS_REWARDS_TOKEN_ADDRESS_TESTNET || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  mainnet: process.env.NEXT_PUBLIC_STACKS_REWARDS_TOKEN_ADDRESS_MAINNET || ""
};

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}
