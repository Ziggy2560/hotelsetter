"use client";

import Image from "next/image";
import { Star, CheckCircle } from "@phosphor-icons/react";
import { formatCurrency, formatDate, nightsBetween, getBoardLabel, getHotelImageUrl } from "@/lib/utils";

interface OrderSummaryProps {
  hotelName: string;
  hotelImage?: string;
  location?: string;
  stars?: number;
  roomName: string;
  checkin: string;
  checkout: string;
  adults: number;
  price: number;
  currency: string;
  nights?: number;
  boardType?: string;
  isRefundable?: boolean;
}

export function OrderSummary({
  hotelName,
  hotelImage,
  location,
  stars,
  roomName,
  checkin,
  checkout,
  adults,
  price,
  currency,
  nights: nightsProp,
  boardType,
  isRefundable,
}: OrderSummaryProps) {
  const nights = nightsProp ?? (checkin && checkout ? nightsBetween(checkin, checkout) : 1);
  const pricePerNight = nights > 0 ? Math.round(price / nights) : price;
  const estimatedTax = Math.round(price * 0.12);
  const total = price + estimatedTax;
  const imageUrl = getHotelImageUrl(hotelImage);

  return (
    <aside
      className="bg-white border border-border rounded-[20px] shadow-sm p-6"
      style={{ position: "sticky", top: "96px" }}
    >
      {/* Hotel info */}
      <div className="flex gap-3 mb-5">
        <div className="w-16 h-16 rounded-[10px] overflow-hidden shrink-0 bg-surface">
          <Image
            src={imageUrl}
            alt={hotelName}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          {stars != null && stars > 0 && (
            <div className="flex items-center gap-0.5 mb-1">
              {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
                <Star key={i} size={12} weight="fill" className="text-star" />
              ))}
            </div>
          )}
          <p className="text-sm font-semibold text-text leading-snug line-clamp-2">{hotelName}</p>
          {location && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{location}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-border mb-5" />

      {/* Booking details */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Room type</span>
          <span className="text-text font-medium text-right max-w-[180px] leading-snug">{roomName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Check-in</span>
          <span className="text-text font-medium">{checkin ? formatDate(checkin) : "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Check-out</span>
          <span className="text-text font-medium">{checkout ? formatDate(checkout) : "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Duration</span>
          <span className="text-text font-medium">{nights} {nights === 1 ? "night" : "nights"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Guests</span>
          <span className="text-text font-medium">{adults} {adults === 1 ? "adult" : "adults"}</span>
        </div>
        {boardType && (
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Board</span>
            <span className="text-text font-medium">{getBoardLabel(boardType)}</span>
          </div>
        )}
      </div>

      <div className="h-px bg-border mb-5" />

      {/* Price breakdown */}
      <div className="flex flex-col gap-2.5 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">
            {formatCurrency(pricePerNight, currency)} &times; {nights} {nights === 1 ? "night" : "nights"}
          </span>
          <span className="text-text font-medium">{formatCurrency(price, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Taxes &amp; fees</span>
          <span className="text-text font-medium">{formatCurrency(estimatedTax, currency)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-border pt-3 mt-0.5">
          <span className="text-text">Total</span>
          <span className="text-text">{formatCurrency(total, currency)}</span>
        </div>
      </div>

      {/* Free cancellation notice */}
      {isRefundable && (
        <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-xl px-3 py-2.5">
          <CheckCircle size={16} weight="fill" className="text-success shrink-0" />
          <span className="text-xs font-medium text-success">Free cancellation available</span>
        </div>
      )}
    </aside>
  );
}
