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

  const refundableTag = bestRate.cancellationPolicies?.refundableTag;
  const isNonRefundable = refundableTag === "NRFN";
  const cancelPolicyInfos = bestRate.cancellationPolicies?.cancelPolicyInfos ?? [];
  const cancelTime = cancelPolicyInfos[0]?.cancelTime;
  const cancelDate = cancelTime ? parseCancelDate(cancelTime) : null;

  const boardCode = bestRate.boardType;
  const boardName = bestRate.boardName || (boardCode ? getBoardLabel(boardCode) : null);

  const roomName = bestRate.name || "Room";

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
      <div className="flex items-start justify-between gap-4">
        {/* Room info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold text-text mb-2 leading-snug">
            {roomName}
          </h3>

          {/* Details row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted mb-3">
            {bestRate.maxOccupancy > 0 && (
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Up to {bestRate.maxOccupancy}
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
          </div>
        </div>

        {/* Pricing + CTA */}
        <div className="flex flex-col items-end shrink-0 gap-3">
          <div className="text-right">
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
                : "bg-brand text-white hover:bg-brand-dark"
            )}
          >
            {isSelected ? "Selected" : "Select room"}
          </button>
        </div>
      </div>
    </article>
  );
}
