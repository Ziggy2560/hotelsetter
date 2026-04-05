"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface BookingData {
  bookingId: string;
  clientReference: string;
  status: string;
  checkin: string;
  checkout: string;
  currency: string;
  price: number;
  hotelName?: string;
  roomName?: string;
  holder?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function StatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase();
  const isConfirmed = upper === "CONFIRMED";
  const isCancelled = upper === "CANCELLED";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        isConfirmed && "bg-success/10 text-success border border-success/20",
        isCancelled && "bg-red-50 text-red-600 border border-red-200",
        !isConfirmed && !isCancelled && "bg-surface text-text-muted border border-border"
      )}
    >
      {status ?? "Unknown"}
    </span>
  );
}

export function BookingLookup() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setBooking(null);
    setCancelled(false);

    try {
      // Heuristic: booking IDs are typically alphanumeric slugs without @;
      // emails contain @
      const isEmail = trimmed.includes("@");
      let data: { data?: BookingData | BookingData[]; error?: string };

      if (isEmail) {
        const res = await fetch(
          `/api/bookings?guestEmail=${encodeURIComponent(trimmed)}`
        );
        data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Lookup failed");

        // API returns array — take the first result
        const arr = Array.isArray(data.data) ? data.data : [];
        if (arr.length === 0) throw new Error("No bookings found for that email.");
        setBooking(arr[0]);
      } else {
        const res = await fetch(`/api/bookings/${encodeURIComponent(trimmed)}`);
        data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Booking not found");
        const single = Array.isArray(data.data) ? data.data[0] : data.data;
        if (!single) throw new Error("Booking not found.");
        setBooking(single as BookingData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(booking.bookingId)}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cancellation failed");

      setCancelled(true);
      setBooking((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      setCancelDialogOpen(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  }

  const isConfirmed = booking?.status?.toUpperCase() === "CONFIRMED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-[28px] font-bold text-text tracking-tight mb-2">
          Manage your booking
        </h1>
        <p className="text-text-muted text-base">
          Enter your booking ID or email address to look up your reservation.
        </p>
      </div>

      {/* Lookup form */}
      <form onSubmit={handleLookup} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Booking ID or email address"
          className={cn(
            "flex-1 bg-white border border-border rounded-[12px] px-4 py-3",
            "text-sm text-text placeholder:text-text-muted",
            "outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40",
            "transition-colors duration-150"
          )}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={cn(
            "bg-brand text-white font-semibold text-sm px-6 py-3 rounded-[12px]",
            "hover:opacity-90 transition-opacity duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? "Looking up…" : "Look up"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* Cancelled success message */}
      {cancelled && (
        <div className="bg-success/10 border border-success/20 rounded-[14px] p-4 text-sm text-success font-medium mb-6">
          Booking successfully cancelled.
        </div>
      )}

      {/* Booking details card */}
      {booking && (
        <div className="bg-white border border-border rounded-[20px] p-7 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Booking reference</p>
              <p className="font-mono text-sm font-semibold text-text bg-surface px-2.5 py-1 rounded-lg inline-block">
                {booking.bookingId}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="border-t border-border pt-4 flex flex-col gap-3.5">
            {booking.hotelName && (
              <DetailRow label="Hotel" value={booking.hotelName} />
            )}
            {booking.roomName && (
              <DetailRow label="Room" value={booking.roomName} />
            )}
            {booking.checkin && (
              <DetailRow label="Check-in" value={formatDate(booking.checkin)} />
            )}
            {booking.checkout && (
              <DetailRow label="Check-out" value={formatDate(booking.checkout)} />
            )}
            {booking.holder && (
              <DetailRow
                label="Guest"
                value={`${booking.holder.firstName} ${booking.holder.lastName}`}
              />
            )}
            {booking.holder?.email && (
              <DetailRow label="Email" value={booking.holder.email} />
            )}
            {booking.clientReference && (
              <DetailRow label="Client reference" value={booking.clientReference} />
            )}
            {booking.price != null && booking.price > 0 && (
              <div className="flex justify-between items-center text-sm font-bold pt-3.5 border-t border-border">
                <span className="text-text">Total</span>
                <span className="text-text text-base">
                  {formatCurrency(booking.price, booking.currency ?? "USD")}
                </span>
              </div>
            )}
          </div>

          {/* Cancel button */}
          {isConfirmed && (
            <div className="pt-1">
              <button
                onClick={() => setCancelDialogOpen(true)}
                className={cn(
                  "w-full border border-red-200 text-red-600 font-semibold text-sm",
                  "rounded-[12px] px-6 py-3",
                  "hover:bg-red-50 transition-colors duration-150"
                )}
              >
                Cancel booking
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Cancellation fees may apply depending
              on the hotel&apos;s policy.
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {cancelError}
            </p>
          )}

          <DialogFooter>
            <button
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
              className={cn(
                "flex-1 border border-border text-text font-semibold text-sm",
                "rounded-[10px] px-4 py-2.5",
                "hover:bg-surface transition-colors duration-150",
                "disabled:opacity-50"
              )}
            >
              Keep booking
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className={cn(
                "flex-1 bg-red-600 text-white font-semibold text-sm",
                "rounded-[10px] px-4 py-2.5",
                "hover:bg-red-700 transition-colors duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {cancelling ? "Cancelling…" : "Yes, cancel"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text text-right max-w-[280px]">{value}</span>
    </div>
  );
}
