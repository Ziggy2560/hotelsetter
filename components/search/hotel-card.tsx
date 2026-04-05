"use client";

import { useRouter } from "next/navigation";
import { MapPin, Star } from "@phosphor-icons/react";
import { cn, formatCurrency, getBoardLabel, getRatingLabel, getHotelImageUrl } from "@/lib/utils";
import type { Hotel } from "@/lib/types";

export interface HotelWithRate extends Hotel {
  lowestPrice?: number;
  totalPrice?: number;
  nights?: number;
  boardType?: string;
  refundable?: boolean;
  displayCurrency?: string;
}

interface HotelCardProps {
  hotel: HotelWithRate;
  checkin: string;
  checkout: string;
  adults: number;
}

export function HotelCard({ hotel, checkin, checkout, adults }: HotelCardProps) {
  const router = useRouter();

  function handleClick() {
    const params = new URLSearchParams({
      checkin,
      checkout,
      adults: String(adults),
    });
    router.push(`/hotel/${hotel.id}?${params.toString()}`);
  }

  const stars = Math.max(0, Math.min(5, Math.round(hotel.stars ?? 0)));
  const hasRating = hotel.rating > 0;
  const ratingLabel = hasRating ? getRatingLabel(hotel.rating) : null;
  const imageUrl = getHotelImageUrl(hotel.main_photo);

  return (
    <article
      onClick={handleClick}
      className={cn(
        "bg-white border border-border rounded-[20px] overflow-hidden cursor-pointer",
        "grid grid-cols-[280px_1fr]",
        "transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      {/* Image */}
      <div className="relative min-h-[220px] overflow-hidden">
        <img
          src={imageUrl}
          alt={hotel.name}
          className={cn(
            "w-full h-full object-cover",
            "transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "hover:scale-105"
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-hotel.svg";
          }}
        />
        {hotel.score >= 8.5 && (
          <span className="absolute top-3 left-3 bg-brand text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-5">
        {/* Top section */}
        <div className="flex-1">
          {/* Stars */}
          {stars > 0 && (
            <div className="flex items-center gap-0.5 mb-1.5">
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} size={13} weight="fill" className="text-star" />
              ))}
            </div>
          )}

          {/* Name */}
          <h3 className="text-[20px] font-bold text-text leading-tight mb-1.5 line-clamp-2">
            {hotel.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-text-muted mb-3">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">
              {hotel.address ? `${hotel.address}, ` : ""}
              {hotel.city}
              {hotel.country ? `, ${hotel.country}` : ""}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {hotel.boardType && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/15">
                {getBoardLabel(hotel.boardType)}
              </span>
            )}
            {hotel.refundable && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/15">
                Free cancellation
              </span>
            )}
            {hotel.chain && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-black/5 text-text-muted border border-black/8">
                {hotel.chain}
              </span>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between pt-4 mt-4 border-t border-border">
          {/* Rating */}
          <div className="flex items-center gap-2">
            {hasRating ? (
              <>
                <span className="w-9 h-9 rounded-[10px] bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {hotel.rating.toFixed(1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text leading-none mb-0.5">
                    {ratingLabel}
                  </p>
                  {hotel.reviewCount > 0 && (
                    <p className="text-xs text-text-muted">
                      {hotel.reviewCount.toLocaleString()} reviews
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-text-muted">No reviews yet</p>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            {hotel.lowestPrice != null && hotel.lowestPrice > 0 ? (
              <>
                <p className="text-[26px] font-bold text-text leading-none">
                  {formatCurrency(hotel.lowestPrice, hotel.displayCurrency ?? hotel.currency ?? "USD")}
                </p>
                <p className="text-xs text-text-muted mt-0.5">per night</p>
                {hotel.totalPrice != null && hotel.nights != null && hotel.nights > 1 && (
                  <p className="text-xs text-text-muted">
                    {formatCurrency(hotel.totalPrice, hotel.displayCurrency ?? hotel.currency ?? "USD")} total
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-text-muted">No availability</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
