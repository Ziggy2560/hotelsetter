"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Minus, Plus, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/types";

interface SearchValues {
  placeId: string;
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number[];
}

interface SearchBarProps {
  variant: "full" | "compact";
  defaultValues?: Partial<SearchValues>;
}

export default function SearchBar({ variant, defaultValues }: SearchBarProps) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [destination, setDestination] = useState(defaultValues?.destination ?? "");
  const [placeId, setPlaceId] = useState(defaultValues?.placeId ?? "");
  const [checkin, setCheckin] = useState(defaultValues?.checkin ?? "");
  const [checkout, setCheckout] = useState(defaultValues?.checkout ?? "");
  const [adults, setAdults] = useState(defaultValues?.adults ?? 2);
  const [children, setChildren] = useState<number[]>(defaultValues?.children ?? []);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

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
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setShowGuestPicker(false);
      }
      if (expanded && expandedRef.current && !expandedRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  function handleSelectPlace(place: Place) {
    setPlaceId(place.placeId);
    setDestination(place.displayName);
    setSuggestions([]);
    setShowDropdown(false);
  }

  function addChild() {
    if (children.length < 4) setChildren([...children, 5]);
  }

  function removeChild(index: number) {
    setChildren(children.filter((_, i) => i !== index));
  }

  function setChildAge(index: number, age: number) {
    const updated = [...children];
    updated[index] = age;
    setChildren(updated);
  }

  function guestSummary() {
    let text = `${adults} adult${adults > 1 ? "s" : ""}`;
    if (children.length > 0) {
      text += `, ${children.length} child${children.length > 1 ? "ren" : ""}`;
    }
    return text;
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
    if (children.length > 0) {
      params.set("children", children.join(","));
    }
    setExpanded(false);
    router.push(`/search?${params.toString()}`);
  }

  // ── Compact variant ──────────────────────────────────────────────────────────
  if (variant === "compact" && !expanded) {
    const parts: string[] = [];
    if (defaultValues?.destination) parts.push(defaultValues.destination);
    if (defaultValues?.checkin && defaultValues?.checkout) {
      parts.push(`${defaultValues.checkin} – ${defaultValues.checkout}`);
    }
    parts.push(guestSummary());
    const summary = parts.join(" | ") || "Search hotels...";

    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer w-full max-w-2xl"
      >
        <span className="text-sm text-text-muted truncate flex-1 text-left">{summary}</span>
        <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center shrink-0">
          <MagnifyingGlass size={14} weight="bold" color="white" />
        </div>
      </button>
    );
  }

  // ── Full / Expanded variant ─────────────────────────────────────────────────
  const isExpanded = variant === "compact" && expanded;

  return (
    <div
      ref={isExpanded ? expandedRef : undefined}
      className={cn(
        "bg-white rounded-[20px] shadow-xl",
        isExpanded && "absolute top-2 left-4 right-4 z-50 border border-border"
      )}
    >
      {/* Close button when expanded from compact */}
      {isExpanded && (
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={() => setExpanded(false)}
            className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <X size={14} weight="bold" className="text-text-muted" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch overflow-visible">
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
                <div className="px-4 py-3 text-sm text-text-muted">Loading...</div>
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
        <div ref={guestRef} className="relative flex-1 border-b sm:border-b-0 sm:border-r border-border px-5 py-4">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1">
            Guests
          </label>
          <button
            type="button"
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="w-full text-sm text-text bg-transparent outline-none text-left cursor-pointer"
          >
            {guestSummary()}
          </button>

          {/* Guest picker dropdown */}
          {showGuestPicker && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-border rounded-2xl shadow-xl z-50 p-5">
              {/* Adults */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-text">Adults</p>
                  <p className="text-xs text-text-muted">Ages 18+</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-text-muted transition-colors"
                  >
                    <Minus size={14} weight="bold" />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(6, adults + 1))}
                    disabled={adults >= 6}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-text-muted transition-colors"
                  >
                    <Plus size={14} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-text">Children</p>
                  <p className="text-xs text-text-muted">Ages 0-17</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(children.slice(0, -1))}
                    disabled={children.length === 0}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-text-muted transition-colors"
                  >
                    <Minus size={14} weight="bold" />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{children.length}</span>
                  <button
                    type="button"
                    onClick={addChild}
                    disabled={children.length >= 4}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-text-muted transition-colors"
                  >
                    <Plus size={14} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Child ages */}
              {children.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  {children.map((age, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">Child {i + 1} age</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={age}
                          onChange={(e) => setChildAge(i, Number(e.target.value))}
                          className="text-sm text-text bg-surface border border-border rounded-lg px-2 py-1 outline-none"
                        >
                          {Array.from({ length: 18 }, (_, a) => (
                            <option key={a} value={a}>{a} {a === 0 ? "infant" : a === 1 ? "year" : "years"}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeChild(i)}
                          className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10"
                        >
                          <X size={10} weight="bold" className="text-text-muted" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Done */}
              <button
                type="button"
                onClick={() => setShowGuestPicker(false)}
                className="w-full mt-4 text-sm font-semibold text-brand hover:underline"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Search button */}
        <div className="flex items-center px-4 py-3 sm:py-0">
          <button
            onClick={handleSearch}
            className="bg-brand text-white text-sm font-semibold px-6 py-3 rounded-[14px] hover:opacity-90 active:scale-[0.98] transition-all duration-300 whitespace-nowrap flex items-center gap-2"
          >
            <MagnifyingGlass size={16} weight="bold" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
