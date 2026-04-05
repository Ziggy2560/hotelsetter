"use client";

import { X } from "@phosphor-icons/react";
import { FilterState } from "@/lib/types";
import { BOARD_TYPES, PROPERTY_TYPES, AMENITY_LIST } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const chips: Chip[] = [];

  // Price range
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) {
    chips.push({
      key: "price",
      label: `$${filters.priceRange[0]} – $${filters.priceRange[1]}`,
      onRemove: () => onChange({ ...filters, priceRange: [0, 2000] }),
    });
  }

  // Star rating
  filters.starRating.forEach((s) => {
    chips.push({
      key: `star-${s}`,
      label: `${s} stars`,
      onRemove: () =>
        onChange({ ...filters, starRating: filters.starRating.filter((x) => x !== s) }),
    });
  });

  // Guest rating
  if (filters.minGuestRating !== null) {
    const labels: Record<number, string> = {
      6: "Pleasant 6+",
      7: "Good 7+",
      8: "Excellent 8+",
      9: "Exceptional 9+",
    };
    chips.push({
      key: "guest-rating",
      label: labels[filters.minGuestRating] ?? `${filters.minGuestRating}+`,
      onRemove: () => onChange({ ...filters, minGuestRating: null }),
    });
  }

  // Board types
  filters.boardTypes.forEach((code) => {
    const bt = BOARD_TYPES.find((b) => b.code === code);
    chips.push({
      key: `board-${code}`,
      label: bt?.label ?? code,
      onRemove: () =>
        onChange({ ...filters, boardTypes: filters.boardTypes.filter((x) => x !== code) }),
    });
  });

  // Refundable only
  if (filters.refundableOnly) {
    chips.push({
      key: "refundable",
      label: "Free cancellation",
      onRemove: () => onChange({ ...filters, refundableOnly: false }),
    });
  }

  // Amenities
  filters.facilityIds.forEach((id) => {
    const amenity = AMENITY_LIST.find((a) => a.id === id);
    chips.push({
      key: `amenity-${id}`,
      label: amenity?.label ?? `Amenity ${id}`,
      onRemove: () =>
        onChange({ ...filters, facilityIds: filters.facilityIds.filter((x) => x !== id) }),
    });
  });

  // Bed types
  filters.bedTypes.forEach((bt) => {
    chips.push({
      key: `bed-${bt}`,
      label: `${bt} bed`,
      onRemove: () =>
        onChange({ ...filters, bedTypes: filters.bedTypes.filter((x) => x !== bt) }),
    });
  });

  // Property types
  filters.hotelTypeIds.forEach((id) => {
    const pt = PROPERTY_TYPES.find((p) => p.id === id);
    chips.push({
      key: `type-${id}`,
      label: pt?.label ?? `Type ${id}`,
      onRemove: () =>
        onChange({ ...filters, hotelTypeIds: filters.hotelTypeIds.filter((x) => x !== id) }),
    });
  });

  // Min reviews
  if (filters.minReviewsCount !== null) {
    chips.push({
      key: "min-reviews",
      label: `${filters.minReviewsCount}+ reviews`,
      onRemove: () => onChange({ ...filters, minReviewsCount: null }),
    });
  }

  // Accessibility
  if (filters.accessibleOnly) {
    chips.push({
      key: "accessible",
      label: "Accessible",
      onRemove: () => onChange({ ...filters, accessibleOnly: false }),
    });
  }

  // AI Search
  if (filters.aiSearch) {
    chips.push({
      key: "ai-search",
      label: `AI: "${filters.aiSearch}"`,
      onRemove: () => onChange({ ...filters, aiSearch: "" }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
            "bg-brand/10 text-brand border border-brand/20"
          )}
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="hover:opacity-70 transition-opacity ml-0.5"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X size={12} weight="bold" />
          </button>
        </span>
      ))}
    </div>
  );
}
