"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { FiltersSidebar } from "./filters-sidebar";
import { HotelCard, type HotelWithRate } from "./hotel-card";
import { ActiveFilters } from "./active-filters";
import { AiSearchBar } from "./ai-search-bar";
import { MapView } from "./map-view";
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

  const router = useRouter();
  const [view, setView] = useState<"list" | "map">("list");

  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [allHotels, setAllHotels] = useState<HotelWithRate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("recommended");

  // ── Rate helpers ─────────────────────────────────────────────────────────────
  function buildRatesMap(
    ratesData: RatesResponse
  ): Record<string, { lowestPrice: number; displayCurrency: string; boardType: string; refundable: boolean }> {
    const map: Record<string, { lowestPrice: number; displayCurrency: string; boardType: string; refundable: boolean }> = {};
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
          boardType = roomType.rates?.[0]?.boardType ?? "";
          const tag = roomType.rates?.[0]?.cancellationPolicies?.refundableTag;
          refundable = tag === "RFN";
        }
      }

      if (lowestPrice < Infinity) {
        map[hotelRates.hotelId] = { lowestPrice, displayCurrency, boardType, refundable };
      }
    }
    return map;
  }

  function mergeHotelsWithRates(
    hotels: HotelsResponse["data"],
    ratesMap: Record<string, { lowestPrice: number; displayCurrency: string; boardType: string; refundable: boolean }>,
    nightCount: number
  ): HotelWithRate[] {
    return hotels.map((h) => {
      const rate = ratesMap[h.id];
      if (!rate) return { ...h };
      const perNight = nightCount > 0 ? Math.round(rate.lowestPrice / nightCount) : rate.lowestPrice;
      return {
        ...h,
        lowestPrice: perNight,
        totalPrice: rate.lowestPrice,
        displayCurrency: rate.displayCurrency,
        nights: nightCount,
        boardType: rate.boardType,
        refundable: rate.refundable,
      };
    });
  }

  // ── Fetch hotels + rates ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!placeId && !destination) {
      setHotelsLoading(false);
      return;
    }

    let cancelled = false;

    const ratesBody = {
      ...(placeId ? { placeId } : { cityName: destination }),
      checkin,
      checkout,
      occupancies: [{ adults }],
      currency: "USD",
      guestNationality: "US",
      includeHotelData: true,
      limit: 200,
      timeout: 15,
      roomMapping: true,
    };

    async function fetchHotels(): Promise<HotelsResponse> {
      const hotelsUrl = placeId
        ? `/api/hotels?placeId=${encodeURIComponent(placeId!)}&limit=200`
        : `/api/hotels?cityName=${encodeURIComponent(destination ?? "")}&limit=200`;
      const r = await fetch(hotelsUrl);
      if (!r.ok) throw new Error("Failed to fetch hotels");
      return r.json() as Promise<HotelsResponse>;
    }

    async function fetchMinRates(
      hotelIds: string[]
    ): Promise<Record<string, { lowestPrice: number; displayCurrency: string }>> {
      if (!checkin || !checkout || hotelIds.length === 0) return {};
      try {
        const r = await fetch("/api/min-rates", {
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
        if (!r.ok) return {};
        const json = await r.json() as {
          data?: { hotelId: string; min?: { retailRate?: number }; currency?: string }[];
        };
        const map: Record<string, { lowestPrice: number; displayCurrency: string }> = {};
        for (const item of json.data ?? []) {
          const total = item.min?.retailRate;
          if (total != null && total > 0) {
            const perNight = nights > 0 ? Math.round(total / nights) : total;
            map[item.hotelId] = {
              lowestPrice: perNight,
              displayCurrency: item.currency ?? "USD",
            };
          }
        }
        return map;
      } catch {
        return {};
      }
    }

    async function fetchRatesStreaming(
      hotels: HotelsResponse["data"]
    ): Promise<void> {
      const response = await fetch("/api/rates/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratesBody),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      // Accumulate rates across all SSE events
      const accumulatedRatesMap: Record<string, { lowestPrice: number; displayCurrency: string; boardType: string; refundable: boolean }> = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (cancelled) { reader.cancel(); break; }

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newline
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const dataLine = event
            .split("\n")
            .find((line) => line.startsWith("data: "));
          if (!dataLine) continue;

          const raw = dataLine.slice(6).trim();
          if (raw === "[DONE]") {
            if (!cancelled) setRatesLoading(false);
            return;
          }

          try {
            const parsed = JSON.parse(raw) as RatesResponse;
            if (parsed?.data) {
              // Merge new rates into accumulator
              const incoming = buildRatesMap(parsed);
              Object.assign(accumulatedRatesMap, incoming);

              // Re-merge and update hotels state progressively
              const merged = mergeHotelsWithRates(hotels, accumulatedRatesMap, nights);
              merged.sort((a, b) => {
                if (a.lowestPrice && !b.lowestPrice) return -1;
                if (!a.lowestPrice && b.lowestPrice) return 1;
                return 0;
              });
              if (!cancelled) setAllHotels(merged);
            }
          } catch {
            // Malformed chunk — skip
          }
        }
      }

      if (!cancelled) setRatesLoading(false);
    }

    async function fetchRatesFallback(
      hotels: HotelsResponse["data"]
    ): Promise<void> {
      const r = await fetch("/api/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ratesBody),
      });
      if (!r.ok) throw new Error(`Rates fallback failed: ${r.status}`);
      const ratesData = (await r.json()) as RatesResponse;
      if (cancelled) return;

      const ratesMap = buildRatesMap(ratesData);
      const merged = mergeHotelsWithRates(hotels, ratesMap, nights);
      merged.sort((a, b) => {
        if (a.lowestPrice && !b.lowestPrice) return -1;
        if (!a.lowestPrice && b.lowestPrice) return 1;
        return 0;
      });
      setAllHotels(merged);
    }

    async function fetchData() {
      setHotelsLoading(true);
      setRatesLoading(true);
      setError(null);

      try {
        // Fetch hotels first so we can show them immediately
        const hotelsData = await fetchHotels();
        if (cancelled) return;

        const hotels = hotelsData.data ?? [];

        // Show hotels (without prices) right away
        setAllHotels(hotels.map((h) => ({ ...h })));
        setHotelsLoading(false);

        // Fetch rates — start min-rates in parallel for fast "from $X" prices,
        // then stream full rates for filters (board type, cancellation policy, etc.)
        if (checkin && checkout) {
          const hotelIds = hotels.map((h) => h.id);

          // Kick off min-rates immediately — much faster than full rates
          const minRatesPromise = fetchMinRates(hotelIds).then((minMap) => {
            if (cancelled || Object.keys(minMap).length === 0) return;
            // Show min-rate prices while full rates are still loading
            setAllHotels((prev) =>
              prev.map((h) => {
                if (h.lowestPrice != null) return h; // already has a full rate
                const mr = minMap[h.id];
                if (!mr) return h;
                return {
                  ...h,
                  lowestPrice: mr.lowestPrice,
                  displayCurrency: mr.displayCurrency,
                };
              })
            );
          });

          try {
            await Promise.all([
              minRatesPromise,
              fetchRatesStreaming(hotels),
            ]);
          } catch {
            if (!cancelled) {
              try {
                await fetchRatesFallback(hotels);
              } catch (fallbackErr) {
                // Rates failed entirely — show hotels without prices
                console.error("Rates fetch failed:", fallbackErr);
              }
              setRatesLoading(false);
            }
          }
        } else {
          setRatesLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setHotelsLoading(false);
          setRatesLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, destination, checkin, checkout, adults]);

  // ── Apply filters ────────────────────────────────────────────────────────────
  const filteredHotels = useMemo(() => {
    let results = [...allHotels];

    // Only hide priceless hotels if we actually got some prices back
    // (prevents clearing the entire list when rates API fails)
    if (!ratesLoading && checkin && checkout) {
      const hasAnyPrices = results.some((h) => h.lowestPrice != null && h.lowestPrice > 0);
      if (hasAnyPrices) {
        results = results.filter((h) => h.lowestPrice != null && h.lowestPrice > 0);
      }
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

              {/* Sort dropdown + List/Map toggle */}
              <div className="flex items-center gap-3">
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

                {/* List / Map toggle */}
                <div className="flex gap-1 bg-white border border-border rounded-[10px] p-0.5">
                  <button
                    onClick={() => setView("list")}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors duration-150",
                      view === "list"
                        ? "bg-brand text-white"
                        : "text-text-muted hover:text-text"
                    )}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setView("map")}
                    className={cn(
                      "px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors duration-150",
                      view === "map"
                        ? "bg-brand text-white"
                        : "text-text-muted hover:text-text"
                    )}
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && view === "list" && (
              <div className="mb-4">
                <ActiveFilters filters={filters} onChange={setFilters} />
              </div>
            )}

            {/* Map view */}
            {view === "map" && placeId && (
              <MapView
                placeId={placeId}
                checkin={checkin}
                checkout={checkout}
                adults={adults}
                onHotelClick={(hotelId) => {
                  const params = new URLSearchParams();
                  if (checkin) params.set("checkin", checkin);
                  if (checkout) params.set("checkout", checkout);
                  params.set("adults", String(adults));
                  router.push(`/hotel/${hotelId}?${params.toString()}`);
                }}
              />
            )}

            {/* Map view — no placeId fallback */}
            {view === "map" && !placeId && (
              <div className="bg-white border border-border rounded-[20px] p-12 text-center">
                <p className="text-lg font-semibold text-text mb-2">
                  Map view unavailable
                </p>
                <p className="text-sm text-text-muted">
                  Select a destination from the search bar to enable map view.
                </p>
              </div>
            )}

            {/* List view content */}
            {view === "list" && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
