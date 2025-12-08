"use client";

import { useState, useEffect } from "react";
import BookingCard from "./BookingCard";

interface Booking {
  id: string;
  spotId: string;
  spotLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  totalCost: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  qrCode?: string;
  transactionHash?: string;
}

interface BookingHistoryProps {
  userAddress: string;
}

export default function BookingHistory({ userAddress }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "completed">("all");

  useEffect(() => {
    fetchBookings();
  }, [userAddress]);


  const filteredBookings = bookings.filter((booking) => {
    // Filter by status
    if (filter !== "all" && booking.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.spotLocation.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <BookingFilters
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No bookings found</p>
          <p className="text-sm text-gray-500">
            {filter === "all"
              ? "You haven't made any bookings yet."
              : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

