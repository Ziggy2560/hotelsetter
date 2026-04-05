import type { HotelDetail } from "@/lib/types";
import { getStars, getRatingLabel } from "@/lib/utils";

interface HotelHeaderProps {
  hotel: HotelDetail;
  rating?: number;
  reviewCount?: number;
}

export default function HotelHeader({ hotel, rating, reviewCount }: HotelHeaderProps) {
  const stars = hotel.starRating ?? 0;
  const starsStr = getStars(Math.min(stars, 5));
  const checkinStart = hotel.checkinCheckoutTimes?.checkin_start;
  const checkinEnd = hotel.checkinCheckoutTimes?.checkin_end;
  const checkout = hotel.checkinCheckoutTimes?.checkout;

  const checkinLabel = checkinStart
    ? checkinEnd
      ? `${checkinStart} – ${checkinEnd}`
      : checkinStart
    : "Flexible";

  const hasRating = rating != null && rating > 0;
  const ratingLabel = hasRating ? getRatingLabel(rating!) : null;

  return (
    <div>
      {/* Stars */}
      {stars > 0 && (
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
            <span key={i} className="text-star text-base leading-none">
              {starsStr[i]}
            </span>
          ))}
        </div>
      )}

      {/* Hotel name */}
      <h1 className="text-[32px] font-bold text-text leading-tight mb-2">
        {hotel.name}
      </h1>

      {/* Address */}
      <div className="flex items-center gap-1.5 text-text-muted mb-5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="text-sm">
          {hotel.address ? `${hotel.address}, ` : ""}
          {hotel.city}
          {hotel.country ? `, ${hotel.country}` : ""}
        </span>
      </div>

      {/* Meta bar */}
      <div className="flex items-center gap-0 flex-wrap bg-white border border-border rounded-[16px] overflow-hidden divide-x divide-border">
        {/* Check-in */}
        <div className="flex flex-col px-5 py-3.5">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-0.5">
            Check-in
          </span>
          <span className="text-sm font-semibold text-text">{checkinLabel}</span>
        </div>

        {/* Check-out */}
        <div className="flex flex-col px-5 py-3.5">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-0.5">
            Check-out
          </span>
          <span className="text-sm font-semibold text-text">{checkout ?? "Flexible"}</span>
        </div>

        {/* Rating badge */}
        {hasRating && (
          <div className="flex items-center gap-3 px-5 py-3.5">
            <span className="w-9 h-9 rounded-[10px] bg-brand text-white flex items-center justify-center text-sm font-bold shrink-0">
              {rating!.toFixed(1)}
            </span>
            <div>
              <p className="text-sm font-semibold text-text leading-none mb-0.5">
                {ratingLabel}
              </p>
              {reviewCount != null && reviewCount > 0 && (
                <p className="text-xs text-text-muted">
                  {reviewCount.toLocaleString()} reviews
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
