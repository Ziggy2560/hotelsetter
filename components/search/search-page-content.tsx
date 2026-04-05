"use client";

import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FiltersSidebar } from "./filters-sidebar";
import { HotelCard, type HotelWithRate } from "./hotel-card";
import { ActiveFilters } from "./active-filters";
import { AiSearchBar } from "./ai-search-bar";
import type { FilterState } from "@/lib/types";
import type { HotelsResponse, RatesResponse } from "@/lib/types";
import { SORT_OPTIONS } from "@/lib/constants";
import { nightsBetween } from "@/lib/utils";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/layout/search-bar";

const DEFAULT_FILTERS: FilterState = {
  priceRange: [0, 2000],
  starRating: [],
  minGuestRating: null,
  boardTypes: [],
  refundableOnly: false,
  facilityIds: [],
  bedTypes: [],
  hotelTypeIds: [],
  chainIds: [],
  minReviewsCount: null,
  accessibleOnly: false,
  aiSearch: "",
};

interface SearchPageContentProps {
  searchParams: Record<string, string>;
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-border rounded-[20px] overflow-hidden grid grid-cols-[280px_1fr]">
      <Skeleton className="min-h-[220px] w-full" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="mt-auto pt-4 flex justify-between items-end">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-[10px]" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchPageContent({ searchParams }: SearchPageContentProps) {
  const { placeId, destination, checkin, checkout, adults: adultsStr } = searchParams;
  const adults = parseInt(adultsStr ?? "2", 10) || 2;
  const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 1;

  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [allHotels, setAllHotels] = useState<HotelWithRate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("recommended");

  // ── Fetch hotels + rates ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!placeId && !destination) {
      setHotelsLoading(false);
      return;
    }

    async function fetchData() {
      setHotelsLoading(true);
      setError(null);

      try {
        // Step 1: Fetch hotel list
        const hotelsUrl = placeId
          ? `/api/hotels?placeId=${encodeURIComponent(placeId)}&limit=200`
          : `/api/hotels?cityName=${encodeURIComponent(destination ?? "")}&limit=200`;

        const hotelsRes = await fetch(hotelsUrl);
        if (!hotelsRes.ok) throw new Error("Failed to fetch hotels");

        const hotelsData: HotelsResponse = await hotelsRes.json();
        const hotels = hotelsData.data ?? [];

        // Show hotels immediately with no rate info
        const hotelsWithoutRates: HotelWithRate[] = hotels.map((h) => ({ ...h }));
        setAllHotels(hotelsWithoutRates);
        setHotelsLoading(false);

        if (hotels.length === 0) return;

        // Step 2: Fetch rates if we have dates
        if (!checkin || !checkout) return;

        setRatesLoading(true);
        const hotelIds = hotels.map((h) => h.id);

        const ratesRes = await fetch("/api/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotelIds,
            checkin,
            checkout,
            occupancies: [{ adults }],
            currency: "USD",
            guestNationality: "US",
          }),
        });

        if (!ratesRes.ok) {
          setRatesLoading(false);
          return;
        }

        const ratesData: RatesResponse = await ratesRes.json();
        const ratesMap: Record<string, { lowestPrice: number; displayCurrency: string; boardType: string; refundable: boolean }> = {};

        for (const hotelRates of ratesData.data ?? []) {
          let lowestPrice = Infinity;
          let displayCurrency = "USD";
          let boardType = "";
          let refundable = false;

          for (const roomType of hotelRates.roomTypes ?? []) {
            const price = roomType.offerRetailRate?.amount;
            if (price != null && price < lowestPrice) {
              lowestPrice = price;
              displayCurrency = roomType.offerRetailRate?.currency ?? "USD";
              // Get board type from first rate
              boardType = roomType.rates?.[0]?.boardType ?? "";
              // Check refundable
              const tag = roomType.rates?.[0]?.cancellationPolicies?.refundableTag;
              refundable = tag === "RFN";
            }
          }

          if (lowestPrice < Infinity) {
            ratesMap[hotelRates.hotelId] = { lowestPrice, displayCurrency, boardType, refundable };
          }
        }

        // Merge rates into hotels
        setAllHotels(
          hotels.map((h) => {
            const rate = ratesMap[h.id];
            if (!rate) return { ...h };
            const perNight = nights > 0 ? Math.round(rate.lowestPrice / nights) : rate.lowestPrice;
            return {
              ...h,
              lowestPrice: perNight,
              totalPrice: rate.lowestPrice,
              displayCurrency: rate.displayCurrency,
              nights,
              boardType: rate.boardType,
              refundable: rate.refundable,
            };
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setHotelsLoading(false);
      } finally {
        setRatesLoading(false);
      }
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, destination, checkin, checkout, adults]);

  // ── Apply filters ────────────────────────────────────────────────────────────
  const filteredHotels = useMemo(() => {
    let results = [...allHotels];

    // Only show hotels with rates (if rates have been loaded)
    if (!ratesLoading && checkin && checkout) {
      // Keep hotels that either have a price or are still loading
      results = results.filter((h) => h.lowestPrice != null && h.lowestPrice > 0);
    }

    // Price range
    results = results.filter((h) => {
      if (h.lowestPrice == null) return true;
      return h.lowestPrice >= filters.priceRange[0] && h.lowestPrice <= filters.priceRange[1];
    });

    // Star rating
    if (filters.starRating.length > 0) {
      results = results.filter((h) => filters.starRating.includes(Math.round(h.stars)));
    }

    // Guest rating
    if (filters.minGuestRating !== null) {
      results = results.filter((h) => h.rating >= filters.minGuestRating!);
    }

    // Board types
    if (filters.boardTypes.length > 0) {
      results = results.filter(
        (h) => h.boardType && filters.boardTypes.includes(h.boardType)
      );
    }

    // Refundable
    if (filters.refundableOnly) {
      results = results.filter((h) => h.refundable === true);
    }

    // Amenities/facilities
    if (filters.facilityIds.length > 0) {
      results = results.filter((h) =>
        filters.facilityIds.every((id) => h.facilityIds?.includes(id))
      );
    }

    // Property types
    if (filters.hotelTypeIds.length > 0) {
      results = results.filter((h) => filters.hotelTypeIds.includes(h.hotelTypeId));
    }

    // Chain IDs
    if (filters.chainIds.length > 0) {
      results = results.filter((h) => filters.chainIds.includes(h.chainId));
    }

    // Min reviews
    if (filters.minReviewsCount !== null) {
      results = results.filter((h) => h.reviewCount >= filters.minReviewsCount!);
    }

    // Accessibility (facilityId 16 is commonly wheelchair)
    if (filters.accessibleOnly) {
      results = results.filter((h) => h.facilityIds?.includes(16));
    }

    // AI search (simple client-side text match)
    if (filters.aiSearch) {
      const query = filters.aiSearch.toLowerCase();
      results = results.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.hotelDescription?.toLowerCase().includes(query) ||
          h.city?.toLowerCase().includes(query) ||
          h.address?.toLowerCase().includes(query)
      );
    }

    return results;
  }, [allHotels, filters, ratesLoading, checkin, checkout]);

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const sortedHotels = useMemo(() => {
    const sorted = [...filteredHotels];
    switch (sort) {
      case "price_asc":
        return sorted.sort((a, b) => (a.lowestPrice ?? Infinity) - (b.lowestPrice ?? Infinity));
      case "price_desc":
        return sorted.sort((a, b) => (b.lowestPrice ?? 0) - (a.lowestPrice ?? 0));
      case "rating":
        return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "stars":
        return sorted.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
      case "reviews":
        return sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
      default:
        // recommended: score-weighted
        return sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
  }, [filteredHotels, sort]);

  const isLoading = hotelsLoading;
  const hasActiveFilters =
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 2000 ||
    filters.starRating.length > 0 ||
    filters.minGuestRating !== null ||
    filters.boardTypes.length > 0 ||
    filters.refundableOnly ||
    filters.facilityIds.length > 0 ||
    filters.bedTypes.length > 0 ||
    filters.hotelTypeIds.length > 0 ||
    filters.chainIds.length > 0 ||
    filters.minReviewsCount !== null ||
    filters.accessibleOnly ||
    !!filters.aiSearch;

  return (
    <div className="bg-surface min-h-screen">
      {/* Search bar re-query strip */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1320px] mx-auto px-8 py-4">
          <SearchBar
            variant="compact"
            defaultValues={{ placeId, destination, checkin, checkout, adults }}
          />
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-8 py-8">
        {/* AI Search Bar */}
        <div className="mb-6">
          <AiSearchBar
            value={filters.aiSearch}
            onChange={(val) => setFilters((f) => ({ ...f, aiSearch: val }))}
          />
        </div>

        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: "280px 1fr" }}
        >
          {/* Sidebar */}
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
            hotels={allHotels}
          />

          {/* Main content */}
          <div className="min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-text">
                  {isLoading
                    ? "Searching hotels…"
                    : `${sortedHotels.length.toLocaleString()} hotel${sortedHotels.length !== 1 ? "s" : ""} found`}
                </h1>
                {destination && (
                  <p className="text-sm text-text-muted mt-0.5">
                    {destination}
                    {checkin && checkout && ` · ${checkin} – ${checkout}`}
                    {` · ${adults} adult${adults !== 1 ? "s" : ""}`}
                  </p>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                {ratesLoading && (
                  <span className="text-xs text-text-muted animate-pulse">
                    Loading prices…
                  </span>
                )}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={cn(
                    "text-sm font-medium text-text bg-white border border-border",
                    "rounded-[10px] px-3 py-2 outline-none cursor-pointer",
                    "hover:border-brand/30 transition-colors duration-200"
                  )}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="mb-4">
                <ActiveFilters filters={filters} onChange={setFilters} />
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[16px] p-6 text-center">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && !error && (
              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && sortedHotels.length === 0 && (
              <div className="bg-white border border-border rounded-[20px] p-12 text-center">
                <p className="text-lg font-semibold text-text mb-2">
                  No hotels found matching your filters
                </p>
                <p className="text-sm text-text-muted mb-6">
                  Try adjusting your filters or search for a different destination.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="bg-brand text-white text-sm font-semibold px-6 py-3 rounded-[12px] hover:opacity-90 transition-opacity"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Hotel cards */}
            {!isLoading && !error && sortedHotels.length > 0 && (
              <div className="space-y-4">
                {sortedHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    checkin={checkin ?? ""}
                    checkout={checkout ?? ""}
                    adults={adults}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
