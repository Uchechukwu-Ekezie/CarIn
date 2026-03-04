/**
 * PaymentEscrow contract constants and utilities for Stacks
 */

// Contract addresses for Stacks
export const PAYMENT_ESCROW_ADDRESSES = {
  testnet: process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS_TESTNET || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.payment-escrow",
  mainnet: process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS_MAINNET || "",
};

export interface EscrowDetails {
  escrowId: string;
  bookingId: string;
  payer: string;
  payee: string;
  amount: string;
  token?: string;
  releaseTime: number;
  status: number;
}

/**
 * Mock function to get escrow details from Stacks
 */
export async function getEscrowDetails(
  escrowId: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<EscrowDetails> {
  console.log(`Fetching Stacks escrow ${escrowId} on ${network}...`);
  // Mock implementation
  return {
    escrowId,
    bookingId: "BOOK-123",
    payer: "ST1PQ...",
    payee: "ST2ABC...",
    amount: "1000000",
    releaseTime: Math.floor(Date.now() / 1000) + 3600,
    status: 1,
  };
}
