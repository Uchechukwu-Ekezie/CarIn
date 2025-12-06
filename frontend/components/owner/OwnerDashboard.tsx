"use client";

import { useState } from "react";
import SpotsList from "./SpotsList";
import EarningsSummary from "./EarningsSummary";
import ListSpotForm from "./ListSpotForm";
import Statistics from "./Statistics";

interface OwnerDashboardProps {
  address: string;
}

export default function OwnerDashboard({ address }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"spots" | "list" | "earnings" | "statistics">("spots");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSpotCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("spots");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Owner Dashboard</h1>
        <p className="text-gray-600">
          Manage your parking spots, view earnings, and track bookings
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("spots")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "spots"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My Spots
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "list"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List New Spot
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "earnings"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === "statistics"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Statistics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "spots" && (
            <SpotsList address={address} refreshTrigger={refreshTrigger} />
          )}
          {activeTab === "list" && (
            <ListSpotForm address={address} onSpotCreated={handleSpotCreated} />
          )}
          {activeTab === "earnings" && (
            <EarningsSummary address={address} />
          )}
          {activeTab === "statistics" && (
            <Statistics address={address} />
          )}
        </div>
      </div>
    </div>
  );
}

