"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/types";

interface SearchValues {
  placeId: string;
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
}

interface SearchBarProps {
  variant: "full" | "compact";
  defaultValues?: Partial<SearchValues>;
}

export default function SearchBar({ variant, defaultValues }: SearchBarProps) {
  const router = useRouter();

  const [destination, setDestination] = useState(defaultValues?.destination ?? "");
  const [placeId, setPlaceId] = useState(defaultValues?.placeId ?? "");
  const [checkin, setCheckin] = useState(defaultValues?.checkin ?? "");
  const [checkout, setCheckout] = useState(defaultValues?.checkout ?? "");
  const [adults, setAdults] = useState(defaultValues?.adults ?? 2);

  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete
  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/places?textQuery=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setSuggestions(json.data ?? []);
          setShowDropdown(true);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (destinationRef.current && !destinationRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectPlace(place: Place) {
    setPlaceId(place.placeId);
    setDestination(place.displayName);
    setSuggestions([]);
    setShowDropdown(false);
  }

  function handleSearch() {
    if (!placeId && !destination) return;
    const params = new URLSearchParams({
      placeId,
      destination,
      checkin,
      checkout,
      adults: String(adults),
    });
    router.push(`/search?${params.toString()}`);
  }

  // ── Compact variant ──────────────────────────────────────────────────────────
  if (variant === "compact") {
    const parts: string[] = [];
    if (defaultValues?.destination) parts.push(defaultValues.destination);
    if (defaultValues?.checkin && defaultValues?.checkout) {
      parts.push(`${defaultValues.checkin} – ${defaultValues.checkout}`);
    }
    if (defaultValues?.adults) {
      parts.push(`${defaultValues.adults} guest${defaultValues.adults !== 1 ? "s" : ""}`);
    }
    const summary = parts.join(" | ") || "Search hotels…";

    return (
      <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 shadow-sm">
        <span className="text-sm text-text-muted truncate max-w-[320px]">{summary}</span>
        <button
          onClick={handleSearch}
          className="ml-1 w-7 h-7 rounded-full bg-brand flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
          aria-label="Search"
        >
          <MagnifyingGlass size={14} weight="bold" color="white" />
        </button>
      </div>
    );
  }

  // ── Full variant ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-[20px] shadow-xl flex flex-col sm:flex-row items-stretch overflow-visible">
      {/* Destination */}
      <div ref={destinationRef} className="relative flex-[2] border-b sm:border-b-0 sm:border-r border-border">
        <div className="px-5 py-4">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setPlaceId("");
              fetchSuggestions(e.target.value);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Where are you going?"
            className="w-full text-sm text-text placeholder:text-text-muted bg-transparent outline-none"
          />
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
            {loadingSuggestions && (
              <div className="px-4 py-3 text-sm text-text-muted">Loading…</div>
            )}
            <ul>
              {suggestions.map((place) => (
                <li key={place.placeId}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelectPlace(place)}
                    className="w-full text-left px-4 py-3 hover:bg-surface transition-colors"
                  >
                    <p className="text-sm font-medium text-text">{place.displayName}</p>
                    <p className="text-xs text-text-muted mt-0.5">{place.formattedAddress}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Check-in */}
      <div className="flex-1 border-b sm:border-b-0 sm:border-r border-border px-5 py-4">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1">
          Check-in
        </label>
        <input
          type="date"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
          className="w-full text-sm text-text bg-transparent outline-none"
        />
      </div>

      {/* Check-out */}
      <div className="flex-1 border-b sm:border-b-0 sm:border-r border-border px-5 py-4">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1">
          Check-out
        </label>
        <input
          type="date"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          className="w-full text-sm text-text bg-transparent outline-none"
        />
      </div>

      {/* Guests */}
      <div className="flex-1 border-b sm:border-b-0 sm:border-r border-border px-5 py-4">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1">
          Guests
        </label>
        <select
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          className="w-full text-sm text-text bg-transparent outline-none cursor-pointer"
        >
          <option value={1}>1 adult</option>
          <option value={2}>2 adults</option>
          <option value={3}>3 adults</option>
          <option value={4}>4 adults</option>
        </select>
      </div>

      {/* Search button */}
      <div className="flex items-center px-4 py-3 sm:py-0">
        <button
          onClick={handleSearch}
          className="bg-brand text-white text-sm font-semibold px-6 py-3 rounded-[14px] hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
        >
          <MagnifyingGlass size={16} weight="bold" />
          Search
        </button>
      </div>
    </div>
  );
}
