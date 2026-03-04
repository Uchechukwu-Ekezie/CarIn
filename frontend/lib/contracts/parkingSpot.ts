/**
 * ParkingSpot contract constants and utilities for Stacks
 */

// Contract addresses for Stacks
export const PARKING_SPOT_ADDRESSES = {
  testnet: process.env.NEXT_PUBLIC_PARKING_SPOT_ADDRESS_TESTNET || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.parking-spot",
  mainnet: process.env.NEXT_PUBLIC_PARKING_SPOT_ADDRESS_MAINNET || "",
};

export interface ParkingSpot {
  id: string;
  owner: string;
  location: string;
  pricePerHour: string;
  isAvailable: boolean;
  createdAt: number;
}

/**
 * Mock function to get spot details from Stacks
 */
export async function getSpotDetails(
  spotId: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<ParkingSpot> {
  console.log(`Fetching Stacks spot ${spotId} on ${network}...`);
  // Mock implementation
  return {
    id: spotId,
    owner: "ST1PQ...",
    location: "San Francisco, CA",
    pricePerHour: "5000000", // 5 STX in uSTX
    isAvailable: true,
    createdAt: Math.floor(Date.now() / 1000) - 86400,
  };
}
