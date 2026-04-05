"use client";

import { useRouter } from "next/navigation";
import { formatCurrency, formatDateShort, nightsBetween } from "@/lib/utils";
import type { Rate, RoomType } from "@/lib/types";

interface SelectedRoom {
  offerId: string;
  roomName: string;
  rate: Rate;
  roomType: RoomType;
}

interface BookingSidebarProps {
  hotelId: string;
  hotelName: string;
  checkin: string;
  checkout: string;
  adults: number;
  selectedRoom: SelectedRoom | null;
}

export default function BookingSidebar({
  hotelId,
  hotelName,
  checkin,
  checkout,
  adults,
  selectedRoom,
}: BookingSidebarProps) {
  const router = useRouter();

  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
  const pricePerNight =
    selectedRoom?.rate?.retailRate?.total?.[0]?.amount != null
      ? selectedRoom.rate.retailRate.total[0].amount / Math.max(nights, 1)
      : null;
  const totalAmount = selectedRoom?.rate?.retailRate?.total?.[0]?.amount ?? null;
  const currency = selectedRoom?.rate?.retailRate?.total?.[0]?.currency ?? "USD";
  const taxesAndFees = selectedRoom?.rate?.retailRate?.taxesAndFees ?? [];
  const includedTax = taxesAndFees.find((t) => !t.included);
  const estimatedTax = includedTax?.amount ?? (totalAmount ? Math.round(totalAmount * 0.12) : null);

  function handleReserve() {
    if (!selectedRoom) return;

    const params = new URLSearchParams({
      offerId: selectedRoom.offerId,
      hotelId,
      hotelName,
      roomName: selectedRoom.roomName,
      checkin,
      checkout,
      adults: String(adults),
      price: String(totalAmount ?? ""),
      currency,
      nights: String(nights),
    });

    router.push(`/booking?${params.toString()}`);
  }

  return (
    <aside
      className="bg-white border border-border rounded-[24px] shadow-sm p-7"
      style={{ position: "sticky", top: "96px" }}
    >
      {/* Price */}
      <div className="mb-5">
        {pricePerNight != null ? (
          <>
            <span className="text-[28px] font-bold text-text leading-none">
              {formatCurrency(pricePerNight, currency)}
            </span>
            <span className="text-text-muted text-sm ml-1">/night</span>
          </>
        ) : (
          <span className="text-[20px] font-bold text-text leading-none">
            Select a room
          </span>
        )}
      </div>

      {/* Dates + Guests */}
      <div className="border border-border rounded-[14px] overflow-hidden mb-4 divide-y divide-border">
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-0.5">
              Check-in
            </p>
            <p className="text-sm font-semibold text-text">
              {checkin ? formatDateShort(checkin) : "—"}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-0.5">
              Check-out
            </p>
            <p className="text-sm font-semibold text-text">
              {checkout ? formatDateShort(checkout) : "—"}
            </p>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-0.5">
            Guests
          </p>
          <p className="text-sm font-semibold text-text">
            {adults} {adults === 1 ? "adult" : "adults"}
          </p>
        </div>
      </div>

      {/* Selected room */}
      <div className="mb-5 px-4 py-3 bg-surface border border-border rounded-[12px]">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-0.5">
          Room
        </p>
        <p className="text-sm font-semibold text-text truncate">
          {selectedRoom ? selectedRoom.roomName : "Select a room below"}
        </p>
      </div>

      {/* Reserve button */}
      <button
        onClick={handleReserve}
        disabled={!selectedRoom}
        className="w-full h-12 bg-brand text-white rounded-[12px] font-semibold text-[15px] transition-all duration-300 hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed mb-5"
      >
        Reserve now
      </button>

      {/* Price breakdown */}
      {selectedRoom && totalAmount != null && (
        <div className="border-t border-border pt-4 flex flex-col gap-2.5">
          {pricePerNight != null && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">
                {formatCurrency(pricePerNight, currency)} &times; {nights} {nights === 1 ? "night" : "nights"}
              </span>
              <span className="text-text font-medium">
                {formatCurrency(pricePerNight * nights, currency)}
              </span>
            </div>
          )}
          {estimatedTax != null && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Taxes &amp; fees</span>
              <span className="text-text font-medium">
                {formatCurrency(estimatedTax, currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-border pt-2.5 mt-0.5">
            <span className="text-text">Total</span>
            <span className="text-text">
              {formatCurrency(totalAmount + (estimatedTax ?? 0), currency)}
            </span>
          </div>
        </div>
      )}

      {!selectedRoom && (
        <p className="text-xs text-text-muted text-center">
          You won&apos;t be charged yet
        </p>
      )}
    </aside>
  );
}
