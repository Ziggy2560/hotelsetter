"use client";

import { useEffect, useState } from "react";
import type { RoomType, Rate } from "@/lib/types";
import RoomCard from "./room-card";
import BookingSidebar from "./booking-sidebar";

interface SelectedRoom {
  offerId: string;
  roomName: string;
  rate: Rate;
  roomType: RoomType;
}

interface RoomRatesClientProps {
  hotelId: string;
  hotelName: string;
  checkin: string;
  checkout: string;
  adults: number;
}

function RoomSkeleton() {
  return (
    <div className="bg-white border border-border rounded-[16px] p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 bg-black/8 rounded w-2/3 mb-3" />
          <div className="h-3 bg-black/5 rounded w-1/3 mb-3" />
          <div className="flex gap-2">
            <div className="h-6 bg-black/5 rounded-full w-24" />
            <div className="h-6 bg-black/5 rounded-full w-32" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="h-7 bg-black/8 rounded w-20" />
          <div className="h-9 bg-black/8 rounded-[10px] w-24" />
        </div>
      </div>
    </div>
  );
}

export default function RoomRatesClient({
  hotelId,
  hotelName,
  checkin,
  checkout,
  adults,
}: RoomRatesClientProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);

  useEffect(() => {
    if (!checkin || !checkout) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelIds: [hotelId],
        checkin,
        checkout,
        occupancies: [{ adults: Number(adults), children: [] }],
        currency: "USD",
        guestNationality: "US",
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load rates (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const hotelData = data?.data?.[0];
        const rooms: RoomType[] = hotelData?.roomTypes ?? [];
        setRoomTypes(rooms);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load rates");
      })
      .finally(() => setLoading(false));
  }, [hotelId, checkin, checkout, adults]);

  function handleSelectRoom(offerId: string, roomName: string, rate: Rate, roomType: RoomType) {
    setSelectedRoom({ offerId, roomName, rate, roomType });
  }

  const showMissingDates = !checkin || !checkout;

  return (
    <>
      {/* Room rates column */}
      <div>
        <h2 className="text-xl font-bold text-text mb-4">Available rooms</h2>

        {showMissingDates && (
          <div className="bg-white border border-border rounded-[16px] p-5 text-sm text-text-muted">
            Add check-in and check-out dates to see available rooms and prices.
          </div>
        )}

        {loading && !showMissingDates && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <RoomSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-border rounded-[16px] p-5 text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && !showMissingDates && roomTypes.length === 0 && (
          <div className="bg-white border border-border rounded-[16px] p-5 text-sm text-text-muted">
            No rooms available for the selected dates.
          </div>
        )}

        {!loading && !error && roomTypes.length > 0 && (
          <div className="flex flex-col gap-3">
            {roomTypes.map((roomType) => (
              <RoomCard
                key={roomType.offerId}
                roomType={roomType}
                checkin={checkin}
                checkout={checkout}
                isSelected={selectedRoom?.offerId === roomType.offerId}
                onSelect={handleSelectRoom}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking sidebar — rendered inside the client component so it can share state */}
      <BookingSidebar
        hotelId={hotelId}
        hotelName={hotelName}
        checkin={checkin}
        checkout={checkout}
        adults={adults}
        selectedRoom={selectedRoom}
      />
    </>
  );
}
