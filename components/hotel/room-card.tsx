import { cn, formatCurrency, getBoardLabel, nightsBetween } from "@/lib/utils";
import type { RoomType, Rate } from "@/lib/types";

interface RoomCardProps {
  roomType: RoomType;
  checkin: string;
  checkout: string;
  isSelected: boolean;
  onSelect: (offerId: string, roomName: string, rate: Rate, roomType: RoomType) => void;
}

function parseCancelDate(cancelTime: string): string | null {
  try {
    const d = new Date(cancelTime);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return null;
  }
}

export default function RoomCard({ roomType, checkin, checkout, isSelected, onSelect }: RoomCardProps) {
  const bestRate = roomType.rates?.[0];
  if (!bestRate) return null;

  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 1;
  const totalAmount = roomType.offerRetailRate?.amount ?? bestRate.retailRate?.total?.[0]?.amount ?? 0;
  const currency = roomType.offerRetailRate?.currency ?? bestRate.retailRate?.total?.[0]?.currency ?? "USD";
  const pricePerNight = nights > 0 ? totalAmount / nights : totalAmount;

  // Comparison price (strikethrough)
  const suggestedPrice = roomType.suggestedSellingPrice?.amount
    ?? bestRate.retailRate?.suggestedSellingPrice?.[0]?.amount;
  const suggestedCurrency = roomType.suggestedSellingPrice?.currency
    ?? bestRate.retailRate?.suggestedSellingPrice?.[0]?.currency ?? currency;
  const hasSaving = suggestedPrice && suggestedPrice > totalAmount;
  const savingPercent = hasSaving
    ? Math.round(((suggestedPrice - totalAmount) / suggestedPrice) * 100)
    : 0;
  const suggestedPerNight = suggestedPrice && nights > 0 ? suggestedPrice / nights : suggestedPrice;

  // Cancellation
  const refundableTag = bestRate.cancellationPolicies?.refundableTag;
  const isNonRefundable = refundableTag === "NRFN";
  const cancelPolicyInfos = bestRate.cancellationPolicies?.cancelPolicyInfos ?? [];
  const cancelTime = cancelPolicyInfos[0]?.cancelTime;
  const cancelDate = cancelTime ? parseCancelDate(cancelTime) : null;

  // Board
  const boardCode = bestRate.boardType;
  const boardName = bestRate.boardName || (boardCode ? getBoardLabel(boardCode) : null);

  // Occupancy
  const maxOccupancy = bestRate.maxOccupancy;
  const adultCount = bestRate.adultCount;
  const childCount = bestRate.childCount;

  // Room name
  const roomName = bestRate.name || "Room";

  // Remarks
  const remarks = (bestRate as unknown as Record<string, unknown>).remarks as string | undefined;

  // Taxes & fees
  const taxesAndFees = bestRate.retailRate?.taxesAndFees ?? [];
  const includedTaxes = taxesAndFees.filter(t => t.included);
  const excludedTaxes = taxesAndFees.filter(t => !t.included);
  const totalExcludedTax = excludedTaxes.reduce((sum, t) => sum + t.amount, 0);

  // Promotions
  const promotions = (bestRate.retailRate as unknown as Record<string, unknown>)?.promotions as
    { name: string; discount: number; discountType: string }[] | undefined;

  // Payment type
  const paymentTypes = bestRate.paymentTypes ?? [];
  const isPrepaid = paymentTypes.includes("PREPAID");

  // Perks
  const perks = (bestRate as unknown as Record<string, unknown>).perks as
    { name: string; amount: number }[] | undefined;

  // Room mapping
  const roomPhoto = bestRate.roomPhotos?.[0];
  const bedType = bestRate.bedType;
  const roomSize = bestRate.roomSize;
  const roomAmenities = bestRate.roomAmenities ?? [];

  function handleSelect() {
    onSelect(roomType.offerId, roomName, bestRate, roomType);
  }

  return (
    <article
      className={cn(
        "bg-white border rounded-[16px] p-5 transition-all duration-300",
        isSelected
          ? "border-brand shadow-sm shadow-brand/10"
          : "border-border hover:border-black/15"
      )}
    >
      {/* Promotion banner */}
      {promotions && promotions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {promotions.map((promo, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>
              {promo.name}{promo.discount > 0 ? ` -${promo.discount}${promo.discountType === "percentage" ? "%" : ""}` : ""}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-6">
        {/* Room photo thumbnail */}
        {roomPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={roomPhoto}
            alt={roomName}
            className="w-20 h-20 rounded-[10px] object-cover shrink-0 self-start"
          />
        )}

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold text-text mb-2 leading-snug">
            {roomName}
          </h3>

          {/* Details row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted mb-3">
            {/* Occupancy */}
            {maxOccupancy > 0 && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {adultCount > 0 && childCount > 0
                  ? `${adultCount} adult${adultCount > 1 ? "s" : ""}, ${childCount} child${childCount > 1 ? "ren" : ""}`
                  : `Sleeps ${maxOccupancy}`}
              </span>
            )}

            {/* Bed type */}
            {bedType && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16M22 4v16M2 12h20M2 20h20M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
                </svg>
                {bedType}
              </span>
            )}

            {/* Room size */}
            {roomSize && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                {roomSize}
              </span>
            )}

            {/* Payment type */}
            {isPrepaid && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Prepaid
              </span>
            )}
            {!isPrepaid && paymentTypes.length > 0 && (
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Pay at hotel
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {boardName && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/15">
                {boardName}
              </span>
            )}
            {isNonRefundable ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                Non-refundable
              </span>
            ) : cancelDate ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/15">
                Free cancellation until {cancelDate}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/15">
                Free cancellation
              </span>
            )}

            {/* Perks */}
            {perks && perks.filter(p => p.name !== "Free cancellation").map((perk, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                {perk.name}
              </span>
            ))}

            {/* Room amenities from room mapping */}
            {roomAmenities.slice(0, 4).map((amenity, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-text-muted border border-black/8">
                {amenity}
              </span>
            ))}
          </div>

          {/* Remarks */}
          {remarks && remarks.trim().length > 0 && (
            <p className="text-xs text-text-muted mt-3 leading-relaxed line-clamp-2">
              {remarks}
            </p>
          )}

          {/* Tax info */}
          {(includedTaxes.length > 0 || totalExcludedTax > 0) && (
            <div className="mt-3 text-xs text-text-faint space-y-0.5">
              {includedTaxes.length > 0 && (
                <p>Includes: {includedTaxes.map(t => t.description || "taxes").join(", ")}</p>
              )}
              {totalExcludedTax > 0 && (
                <p>+ {formatCurrency(totalExcludedTax, currency)} taxes & fees due at property</p>
              )}
            </div>
          )}
        </div>

        {/* Pricing + CTA */}
        <div className="flex flex-col items-end shrink-0 gap-3">
          <div className="text-right">
            {/* Saving badge */}
            {hasSaving && savingPercent >= 5 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100 mb-1.5">
                Save {savingPercent}%
              </span>
            )}

            {/* Strikethrough comparison price */}
            {hasSaving && suggestedPerNight && (
              <p className="text-sm text-text-faint line-through">
                {formatCurrency(suggestedPerNight, suggestedCurrency)}
              </p>
            )}

            <p className="text-[22px] font-bold text-text leading-none">
              {formatCurrency(pricePerNight, currency)}
            </p>
            <p className="text-xs text-text-muted mt-0.5">/night</p>
            {nights > 1 && (
              <p className="text-xs text-text-muted mt-0.5">
                {formatCurrency(totalAmount, currency)} total
              </p>
            )}
          </div>
          <button
            onClick={handleSelect}
            className={cn(
              "px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-300",
              isSelected
                ? "bg-brand text-white"
                : "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]"
            )}
          >
            {isSelected ? "Selected" : "Select room"}
          </button>
        </div>
      </div>
    </article>
  );
}
