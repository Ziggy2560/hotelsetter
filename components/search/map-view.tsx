"use client";
import { useEffect, useRef, useState } from "react";

interface MapViewProps {
  placeId: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  onHotelClick?: (hotelId: string) => void;
}

export function MapView({ placeId, checkin, checkout, adults, onHotelClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialized.current) return;

    let attempts = 0;
    const maxAttempts = 20;

    const interval = setInterval(() => {
      attempts++;

      if (typeof window !== "undefined" && (window as any).LiteAPI) {
        clearInterval(interval);
        initialized.current = true;

        try {
          (window as any).LiteAPI.init({ domain: "hotelsetter.nuitee.link" });
          (window as any).LiteAPI.Map.create({
            selector: "#hotel-map",
            placeId,
            primaryColor: "#007AFF",
            hideLogo: true,
            currency: "USD",
            onHotelClick: (hotelId: string) => {
              if (onHotelClick) onHotelClick(hotelId);
            },
            deepLinkParams:
              checkin && checkout
                ? { checkin, checkout, adults: adults ?? 2 }
                : undefined,
          });
          setLoading(false);
        } catch (err) {
          console.error("Map widget init failed:", err);
          setError(true);
          setLoading(false);
        }
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setError(true);
        setLoading(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [placeId, checkin, checkout, adults, onHotelClick]);

  if (error) {
    return (
      <div className="w-full h-[500px] rounded-[20px] border border-border overflow-hidden bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted text-sm">Map view is currently unavailable</p>
          <p className="text-text-faint text-xs mt-1">Switch to List view to browse hotels</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        id="hotel-map"
        className="w-full h-[500px] rounded-[20px] border border-border overflow-hidden bg-white"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-white">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-muted">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
