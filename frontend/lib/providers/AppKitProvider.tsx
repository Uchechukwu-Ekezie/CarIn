"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

interface StacksAuthContextType {
  isConnected: boolean;
  stxAddress: string | null;
  connectWallet: () => Promise<void>;
  logout: () => void;
}

const StacksAuthContext = createContext<StacksAuthContextType | undefined>(undefined);

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const checkAuth = () => {
    try {
      if (isConnected()) {
        const userData = getLocalStorage();
        const stxEntry = (userData as any)?.addresses?.find((a: any) => a.symbol === 'STX' || a.type === 'p2wpkh' || a.type === 'p2tr');
        if (stxEntry) {
          setConnected(true);
          setAddress(stxEntry.address);
        } else {
          setConnected(false);
          setAddress(null);
        }
      } else {
        setConnected(false);
        setAddress(null);
      }
    } catch (e) {
      console.error("Auth check failed:", e);
      setConnected(false);
      setAddress(null);
    }
  };

  useEffect(() => {
    checkAuth();

    // Sync across tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("stacks-auth") || e.key?.includes("blockstack-session")) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const connectWallet = async () => {
    try {
      const response = await connect();
      const stxEntry = (response as any)?.addresses?.find((a: any) => a.symbol === 'STX' || a.type === 'p2wpkh' || a.type === 'p2tr');
      if (stxEntry) {
        setConnected(true);
        setAddress(stxEntry.address);
      } else {
        // Fallback to check storage if response structure varies
        checkAuth();
      }
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const logout = () => {
    disconnect();
    setConnected(false);
    setAddress(null);
  };

  return (
    <StacksAuthContext.Provider
      value={{ isConnected: connected, stxAddress: address, connectWallet, logout }}
    >
      {children}
    </StacksAuthContext.Provider>
  );
}

export const useStacksAuth = () => {
  const context = useContext(StacksAuthContext);
  if (context === undefined) {
    throw new Error("useStacksAuth must be used within a StacksAuthProvider");
  }
  return context;
};
