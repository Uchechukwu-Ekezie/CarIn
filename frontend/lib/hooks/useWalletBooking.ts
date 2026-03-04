import { useStacksAuth } from "@/lib/providers/AppKitProvider";

export interface WalletBookingState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  balance: string | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
}

/**
 * Hook for wallet booking actions, now ported to Stacks
 */
export function useWalletBooking() {
  const {
    isConnected,
    stxAddress: address,
    connectWallet: providerConnect,
    logout: providerLogout
  } = useStacksAuth();

  // Mock balance and chain for Stacks during migration
  const balance = isConnected ? "50.0 STX" : null;
  const chainId = isConnected ? "testnet" : null;

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!isConnected) {
        await providerConnect();
        return { success: true };
      }
      return { success: true, address };
    } catch (error: any) {
      return { success: false, error: error?.message || "Failed to connect wallet" };
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    providerLogout();
  };

  // Check if wallet is connected
  const checkConnection = () => {
    return isConnected;
  };

  // Stacks doesn't typically require manual chain switching in the same way,
  // but we can provide placeholders for API compatibility
  const switchToAlfajores = async () => {
    console.log("Switching to Stacks Testnet...");
    return { success: true };
  };

  const switchToMainnet = async () => {
    console.log("Switching to Stacks Mainnet...");
    return { success: true };
  };

  return {
    // State
    isConnected,
    address: address || null,
    chainId,
    balance,
    isConnecting: false,
    isDisconnecting: false,
    isSwitching: false,
    // Actions
    connectWallet,
    disconnectWallet,
    checkConnection,
    switchToAlfajores,
    switchToMainnet,
    // Additional data
    connectors: [], // Empty for Stacks bridge compatibility
  };
}
