"use client";

import { useRewards } from "@/lib/hooks/useRewards";
import { RewardType } from "@/lib/contracts/rewardsManager";
import { useAccount } from "wagmi";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";

export default function RewardsPage() {
  const { address, isConnected } = useAccount();
  const { balance, loading, error, claimReward, claimAllRewards } = useRewards();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Rewards Dashboard</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Please connect your wallet to view your rewards</p>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  const handleClaimReward = async (rewardType: RewardType) => {
    try {
      await claimReward(rewardType);
      alert("Reward claimed successfully!");
    } catch (err) {
      alert(`Failed to claim reward: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleClaimAll = async () => {
    try {
      await claimAllRewards();
      alert("All rewards claimed successfully!");
    } catch (err) {
      alert(`Failed to claim rewards: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Rewards Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading rewards...</p>
          </div>
        ) : balance ? (
          <div className="space-y-6">
            {/* Total Balance Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Your Rewards Balance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-3xl font-bold text-blue-600">{balance.balance} CARIN</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Pending Rewards</p>
                  <p className="text-2xl font-semibold text-green-600">{balance.pendingTotal} CARIN</p>
                </div>
              </div>
            </div>

            {/* Pending Rewards Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Rewards Breakdown</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Inaccuracy Reports</p>
                  <p className="text-lg font-semibold">{balance.pendingByType.inaccuracyReport} CARIN</p>
                  {parseFloat(balance.pendingByType.inaccuracyReport) > 0 && (
                    <button
                      onClick={() => handleClaimReward(RewardType.InaccuracyReport)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Claim
                    </button>
                  )}
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Spot Shares</p>
                  <p className="text-lg font-semibold">{balance.pendingByType.spotShare} CARIN</p>
                  {parseFloat(balance.pendingByType.spotShare) > 0 && (
                    <button
                      onClick={() => handleClaimReward(RewardType.SpotShare)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Claim
                    </button>
                  )}
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Referrals</p>
                  <p className="text-lg font-semibold">{balance.pendingByType.referral} CARIN</p>
                  {parseFloat(balance.pendingByType.referral) > 0 && (
                    <button
                      onClick={() => handleClaimReward(RewardType.Referral)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Claim
                    </button>
                  )}
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-600 mb-1">Community Contributions</p>
                  <p className="text-lg font-semibold">{balance.pendingByType.communityContribution} CARIN</p>
                  {parseFloat(balance.pendingByType.communityContribution) > 0 && (
                    <button
                      onClick={() => handleClaimReward(RewardType.CommunityContribution)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Claim All Button */}
            {parseFloat(balance.pendingTotal) > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <button
                  onClick={handleClaimAll}
                  className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  Claim All Pending Rewards ({balance.pendingTotal} CARIN)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No rewards data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

