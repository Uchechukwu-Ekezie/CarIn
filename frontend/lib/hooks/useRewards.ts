import { useState, useEffect, useCallback } from "react";
import { useStacksAuth } from "@/lib/providers/AppKitProvider";

interface RewardBalance {
  balance: string;
  pendingTotal: string;
  pendingByType: {
    inaccuracyReport: string;
    spotShare: string;
    referral: string;
    communityContribution: string;
  };
}

interface Report {
  reportId: string;
  spotId: string;
  reason: string;
  timestamp: number;
  isValid: boolean;
  claimStatus: number;
  rewardAmount: string;
}

interface Referral {
  referralHash: string;
  referee: string;
  spotId: string;
  timestamp: number;
  isActive: boolean;
  rewardAmount: string;
  claimStatus: number;
}

export function useRewards() {
  const { stxAddress: address, isConnected } = useStacksAuth();
  const [balance, setBalance] = useState<RewardBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(async () => {
    if (!address || !isConnected) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mock implementation for Stacks migration
      setBalance({
        balance: "125.50",
        pendingTotal: "12.25",
        pendingByType: {
          inaccuracyReport: "5.00",
          spotShare: "4.25",
          referral: "3.00",
          communityContribution: "0.00",
        },
      });
    } catch (err) {
      console.error("Error loading rewards balance:", err);
      setError(err instanceof Error ? err.message : "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const claimReward = useCallback(
    async (rewardType: any) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        console.log("Claiming reward on Stacks...", rewardType);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadBalance();
      } catch (err) {
        console.error("Error claiming reward:", err);
        setError(err instanceof Error ? err.message : "Failed to claim reward");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, loadBalance]
  );

  const claimAllRewards = useCallback(async () => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      setLoading(true);
      console.log("Claiming all rewards on Stacks...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadBalance();
    } catch (err) {
      console.error("Error claiming all rewards:", err);
      setError(err instanceof Error ? err.message : "Failed to claim rewards");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, loadBalance]);

  return {
    balance,
    loading,
    error,
    loadBalance,
    claimReward,
    claimAllRewards,
  };
}

export function useRewardReports() {
  const { stxAddress: address, isConnected } = useStacksAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = useCallback(async () => {
    if (!address || !isConnected) {
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      // Mock data for Stacks migration
      setReports([
        {
          reportId: "1",
          spotId: "101",
          reason: "Incorrect coordinates",
          timestamp: Date.now() - 86400000,
          isValid: true,
          claimStatus: 1,
          rewardAmount: "5.0",
        }
      ]);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const submitReport = useCallback(
    async (spotId: string, reason: string, evidenceHash: string) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        console.log("Submitting report on Stacks...", { spotId, reason });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await loadReports();
      } catch (err) {
        console.error("Error submitting report:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, loadReports]
  );

  return { reports, loading, submitReport, loadReports };
}

export function useReferrals() {
  const { stxAddress: address, isConnected } = useStacksAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReferrals = useCallback(async () => {
    if (!address || !isConnected) {
      setReferrals([]);
      return;
    }

    try {
      setLoading(true);
      // Mock data for Stacks migration
      setReferrals([
        {
          referralHash: "0xabc...",
          referee: "ST123...",
          spotId: "102",
          timestamp: Date.now() - 172800000,
          isActive: true,
          rewardAmount: "3.0",
          claimStatus: 1,
        }
      ]);
    } catch (err) {
      console.error("Error loading referrals:", err);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const createReferral = useCallback(
    async (referee: string, spotId: string) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        console.log("Creating referral on Stacks...", { referee, spotId });
        await new Promise(resolve => setTimeout(resolve, 1500));
        await loadReferrals();
      } catch (err) {
        console.error("Error creating referral:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, loadReferrals]
  );

  return { referrals, loading, createReferral, loadReferrals };
}
