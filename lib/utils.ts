import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function nightsBetween(checkin: string, checkout: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const from = new Date(checkin + "T00:00:00").getTime();
  const to = new Date(checkout + "T00:00:00").getTime();
  return Math.round((to - from) / msPerDay);
}

export function getBoardLabel(code: string): string {
  const map: Record<string, string> = {
    RO: "Room Only",
    BB: "Breakfast included",
    HB: "Half Board",
    FB: "Full Board",
    AI: "All Inclusive",
  };
  return map[code] ?? code;
}

export function getRatingLabel(rating: number): string {
  if (rating >= 9) return "Exceptional";
  if (rating >= 8) return "Excellent";
  if (rating >= 7) return "Good";
  if (rating >= 6) return "Pleasant";
  return "Fair";
}

export function getStars(count: number): string {
  return "★".repeat(Math.max(0, Math.min(count, 10)));
}

export function getHotelImageUrl(
  url: string | undefined,
  fallback = "/placeholder-hotel.svg"
): string {
  return url && url.trim() !== "" ? url : fallback;
}
