"use client";
import { useEffect, useRef } from "react";

interface MapViewProps {
  placeId: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  onHotelClick?: (hotelId: string) => void;
}

export function MapView({ placeId, checkin, checkout, adults, onHotelClick }: MapViewProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (typeof window === "undefined" || !(window as any).LiteAPI) return;

    initialized.current = true;
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
        checkin && checkout ? { checkin, checkout, adults: adults ?? 2 } : undefined,
    });
  }, [placeId, checkin, checkout, adults, onHotelClick]);

  return (
    <div
      id="hotel-map"
      className="w-full h-[500px] rounded-[20px] border border-border overflow-hidden bg-white"
    />
  );
}
