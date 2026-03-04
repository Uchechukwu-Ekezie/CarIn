/**
 * RewardsManager contract constants and utilities for Stacks
 */

// Contract addresses for Stacks
export const REWARDS_MANAGER_ADDRESSES = {
  testnet: process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS_TESTNET || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.rewards-manager",
  mainnet: process.env.NEXT_PUBLIC_REWARDS_MANAGER_ADDRESS_MAINNET || "",
};

// Reward types enum
export enum RewardType {
  InaccuracyReport = 0,
  SpotShare = 1,
  Referral = 2,
  CommunityContribution = 3,
}

/**
 * Interface for Stacks-based rewards management
 */
export interface StacksRewardSession {
  stxAddress: string;
  network: "testnet" | "mainnet";
}

// Mock hash function (Stacks uses SipHash or SHA-256 differently, but for types we just need string)
export function calculateReferralHash(
  referrer: string,
  referee: string,
  spotId: string
): string {
  return `REF-${referrer.slice(-4)}-${referee.slice(-4)}-${spotId}`;
}
