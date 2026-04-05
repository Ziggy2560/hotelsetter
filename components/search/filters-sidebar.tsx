"use client";

import { useState } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { FilterState } from "@/lib/types";
import { BOARD_TYPES, BED_TYPES, PROPERTY_TYPES, AMENITY_LIST } from "@/lib/constants";
import type { HotelWithRate } from "./hotel-card";

interface FiltersSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  hotels: HotelWithRate[];
}

// Count helpers
function countByPredicate(hotels: HotelWithRate[], predicate: (h: HotelWithRate) => boolean) {
  return hotels.filter(predicate).length;
}

function SectionDivider() {
  return <div className="h-px bg-border my-5" />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[13px] font-semibold text-text uppercase tracking-wider mb-3">
      {children}
    </h4>
  );
}

export function FiltersSidebar({ filters, onChange, onClear, hotels }: FiltersSidebarProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllChains, setShowAllChains] = useState(false);

  // Derive chain list from hotels
  const chainCounts: Record<string, { id: number; label: string; count: number }> = {};
  hotels.forEach((h) => {
    if (h.chain && h.chainId) {
      if (!chainCounts[h.chainId]) {
        chainCounts[h.chainId] = { id: h.chainId, label: h.chain, count: 0 };
      }
      chainCounts[h.chainId].count++;
    }
  });
  const chainList = Object.values(chainCounts).sort((a, b) => b.count - a.count);
  const visibleChains = showAllChains ? chainList : chainList.slice(0, 5);
  const hiddenChainsCount = chainList.length - 5;

  // Amenities display
  const visibleAmenities = showAllAmenities ? AMENITY_LIST : AMENITY_LIST.slice(0, 6);
  const hiddenAmenitiesCount = AMENITY_LIST.length - 6;

  function toggleStar(star: number) {
    const current = filters.starRating;
    if (current.includes(star)) {
      onChange({ ...filters, starRating: current.filter((s) => s !== star) });
    } else {
      onChange({ ...filters, starRating: [...current, star] });
    }
  }

  function toggleBoardType(code: string) {
    const current = filters.boardTypes;
    if (current.includes(code)) {
      onChange({ ...filters, boardTypes: current.filter((b) => b !== code) });
    } else {
      onChange({ ...filters, boardTypes: [...current, code] });
    }
  }

  function toggleFacility(id: number) {
    const current = filters.facilityIds;
    if (current.includes(id)) {
      onChange({ ...filters, facilityIds: current.filter((f) => f !== id) });
    } else {
      onChange({ ...filters, facilityIds: [...current, id] });
    }
  }

  function toggleBedType(bt: string) {
    const current = filters.bedTypes;
    if (current.includes(bt)) {
      onChange({ ...filters, bedTypes: current.filter((b) => b !== bt) });
    } else {
      onChange({ ...filters, bedTypes: [...current, bt] });
    }
  }

  function togglePropertyType(id: number) {
    const current = filters.hotelTypeIds;
    if (current.includes(id)) {
      onChange({ ...filters, hotelTypeIds: current.filter((t) => t !== id) });
    } else {
      onChange({ ...filters, hotelTypeIds: [...current, id] });
    }
  }

  function toggleChain(id: number) {
    const current = filters.chainIds;
    if (current.includes(id)) {
      onChange({ ...filters, chainIds: current.filter((c) => c !== id) });
    } else {
      onChange({ ...filters, chainIds: [...current, id] });
    }
  }

  // Star counts
  const starCounts: Record<number, number> = {};
  [2, 3, 4, 5].forEach((s) => {
    starCounts[s] = countByPredicate(hotels, (h) => Math.round(h.stars) === s);
  });

  // Board type counts
  const boardCounts: Record<string, number> = {};
  BOARD_TYPES.forEach((bt) => {
    boardCounts[bt.code] = countByPredicate(hotels, (h) => h.boardType === bt.code);
  });

  // Property type counts
  const propCounts: Record<number, number> = {};
  PROPERTY_TYPES.forEach((pt) => {
    propCounts[pt.id] = countByPredicate(hotels, (h) => h.hotelTypeId === pt.id);
  });

  return (
    <aside
      className="bg-white border border-border rounded-[20px] p-5"
      style={{
        position: "sticky",
        top: "88px",
        maxHeight: "calc(100dvh - 100px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-text">Filters</h3>
        <button
          onClick={onClear}
          className="text-xs font-medium text-brand hover:opacity-70 transition-opacity"
        >
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div>
        <SectionTitle>Price per night</SectionTitle>
        <Slider
          min={0}
          max={2000}
          value={filters.priceRange}
          onValueChange={(val) =>
            onChange({ ...filters, priceRange: val as [number, number] })
          }
          className="mb-3"
        />
        <div className="flex justify-between text-sm font-medium text-text-muted">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      <SectionDivider />

      {/* Star Rating */}
      <div>
        <SectionTitle>Star rating</SectionTitle>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((s) => (
            <label
              key={s}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={filters.starRating.includes(s)}
                onChange={() => toggleStar(s)}
                className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
              />
              <span className="flex-1 flex items-center gap-1.5">
                {Array.from({ length: s }).map((_, i) => (
                  <PhosphorIcons.Star key={i} size={13} weight="fill" className="text-star" />
                ))}
              </span>
              {starCounts[s] > 0 && (
                <span className="text-xs text-text-faint">{starCounts[s]}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Guest Rating */}
      <div>
        <SectionTitle>Guest rating</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 9, label: "9+ Exceptional" },
            { value: 8, label: "8+ Excellent" },
            { value: 7, label: "7+ Good" },
            { value: 6, label: "6+ Pleasant" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                onChange({
                  ...filters,
                  minGuestRating: filters.minGuestRating === value ? null : value,
                })
              }
              className={cn(
                "px-3 py-2 rounded-[10px] text-xs font-medium border transition-colors duration-200",
                filters.minGuestRating === value
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-text-muted border-border hover:border-brand/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Board Type */}
      <div>
        <SectionTitle>Board type</SectionTitle>
        <div className="space-y-2">
          {BOARD_TYPES.map((bt) => (
            <label key={bt.code} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.boardTypes.includes(bt.code)}
                onChange={() => toggleBoardType(bt.code)}
                className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
              />
              <span className="flex-1 text-sm text-text">{bt.label}</span>
              {boardCounts[bt.code] > 0 && (
                <span className="text-xs text-text-faint">{boardCounts[bt.code]}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Free Cancellation */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.refundableOnly}
            onChange={(e) => onChange({ ...filters, refundableOnly: e.target.checked })}
            className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
          />
          <span className="text-sm font-medium text-text">Free cancellation only</span>
        </label>
      </div>

      <SectionDivider />

      {/* Amenities */}
      <div>
        <SectionTitle>Amenities</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {visibleAmenities.map((amenity) => {
            const IconComponent = (PhosphorIcons as unknown as Record<string, React.ElementType>)[amenity.icon];
            const selected = filters.facilityIds.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                onClick={() => toggleFacility(amenity.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200",
                  selected
                    ? "bg-brand text-white border-brand"
                    : "bg-surface text-text-muted border-border hover:border-brand/30"
                )}
              >
                {IconComponent && <IconComponent size={13} />}
                {amenity.label}
              </button>
            );
          })}
        </div>
        {hiddenAmenitiesCount > 0 && (
          <button
            onClick={() => setShowAllAmenities(!showAllAmenities)}
            className="mt-2 text-xs font-medium text-brand hover:opacity-70 transition-opacity"
          >
            {showAllAmenities ? "Show less" : `Show ${hiddenAmenitiesCount} more`}
          </button>
        )}
      </div>

      <SectionDivider />

      {/* Bed Type */}
      <div>
        <SectionTitle>Bed type</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {BED_TYPES.map((bt) => (
            <button
              key={bt}
              onClick={() => toggleBedType(bt)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-200",
                filters.bedTypes.includes(bt)
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-text-muted border-border hover:border-brand/30"
              )}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Property Type */}
      <div>
        <SectionTitle>Property type</SectionTitle>
        <div className="space-y-2">
          {PROPERTY_TYPES.map((pt) => (
            <label key={pt.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hotelTypeIds.includes(pt.id)}
                onChange={() => togglePropertyType(pt.id)}
                className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
              />
              <span className="flex-1 text-sm text-text">{pt.label}</span>
              {propCounts[pt.id] > 0 && (
                <span className="text-xs text-text-faint">{propCounts[pt.id]}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {chainList.length > 0 && (
        <>
          <SectionDivider />

          {/* Hotel Chain */}
          <div>
            <SectionTitle>Hotel chain</SectionTitle>
            <div className="space-y-2">
              {visibleChains.map((chain) => (
                <label key={chain.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.chainIds.includes(chain.id)}
                    onChange={() => toggleChain(chain.id)}
                    className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
                  />
                  <span className="flex-1 text-sm text-text">{chain.label}</span>
                  <span className="text-xs text-text-faint">{chain.count}</span>
                </label>
              ))}
            </div>
            {hiddenChainsCount > 0 && (
              <button
                onClick={() => setShowAllChains(!showAllChains)}
                className="mt-2 text-xs font-medium text-brand hover:opacity-70 transition-opacity"
              >
                {showAllChains ? "Show less" : `Show ${hiddenChainsCount} more`}
              </button>
            )}
          </div>
        </>
      )}

      <SectionDivider />

      {/* Minimum Reviews */}
      <div>
        <SectionTitle>Minimum reviews</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {[50, 100, 500, 1000].map((count) => (
            <button
              key={count}
              onClick={() =>
                onChange({
                  ...filters,
                  minReviewsCount: filters.minReviewsCount === count ? null : count,
                })
              }
              className={cn(
                "px-3 py-2 rounded-[10px] text-xs font-medium border transition-colors duration-200",
                filters.minReviewsCount === count
                  ? "bg-brand text-white border-brand"
                  : "bg-surface text-text-muted border-border hover:border-brand/30"
              )}
            >
              {count}+
            </button>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Accessibility */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.accessibleOnly}
            onChange={(e) => onChange({ ...filters, accessibleOnly: e.target.checked })}
            className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
          />
          <span className="text-sm font-medium text-text">Wheelchair accessible</span>
        </label>
      </div>
    </aside>
  );
}
