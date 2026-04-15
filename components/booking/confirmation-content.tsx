"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Warning } from "@phosphor-icons/react/dist/ssr";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BookingContext {
  prebookId: string;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  hotelName: string;
  roomName: string;
  checkin: string;
  checkout: string;
  price: number;
  currency: string;
  specialRequests?: string;
}

type Status = "idle" | "finalizing" | "success" | "error";

export function ConfirmationContent() {
  const searchParams = useSearchParams();
  const ranRef = useRef(false);

  // SDK appends `tid` (transactionId) on success
  const tid = searchParams.get("tid") ?? searchParams.get("transactionId") ?? "";

  // Legacy / fallback params (manual flow already booked)
  const legacyBookingId = searchParams.get("bookingId") ?? "";

  const [status, setStatus] = useState<Status>(legacyBookingId ? "success" : tid ? "finalizing" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string>(legacyBookingId);
  const [details, setDetails] = useState<{
    hotel: string;
    room: string;
    checkin: string;
    checkout: string;
    price: number;
    currency: string;
  }>({
    hotel: searchParams.get("hotel") ?? "",
    room: searchParams.get("room") ?? "",
    checkin: searchParams.get("checkin") ?? "",
    checkout: searchParams.get("checkout") ?? "",
    price: parseFloat(searchParams.get("price") ?? "0") || 0,
    currency: searchParams.get("currency") ?? "USD",
  });

  useEffect(() => {
    if (ranRef.current) return;
    if (!tid || legacyBookingId) return;
    ranRef.current = true;

    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem("hs:bookingContext");
    } catch {
      // ignore
    }

    if (!raw) {
      setStatus("error");
      setError("Booking context missing. Please restart your booking.");
      return;
    }

    let ctx: BookingContext;
    try {
      ctx = JSON.parse(raw);
    } catch {
      setStatus("error");
      setError("Could not read booking context.");
      return;
    }

    setDetails({
      hotel: ctx.hotelName,
      room: ctx.roomName,
      checkin: ctx.checkin,
      checkout: ctx.checkout,
      price: ctx.price,
      currency: ctx.currency,
    });

    fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prebookId: ctx.prebookId,
        holder: {
          firstName: ctx.guest.firstName,
          lastName: ctx.guest.lastName,
          email: ctx.guest.email,
          phone: ctx.guest.phone,
        },
        guests: [
          {
            occupancyNumber: 1,
            firstName: ctx.guest.firstName,
            lastName: ctx.guest.lastName,
            email: ctx.guest.email,
            ...(ctx.specialRequests ? { remarks: ctx.specialRequests } : {}),
          },
        ],
        payment: {
          method: "TRANSACTION_ID",
          transactionId: tid,
        },
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Booking failed");
        const id = json.data?.bookingId ?? "";
        setBookingId(id);
        setStatus("success");
        try {
          window.sessionStorage.removeItem("hs:bookingContext");
        } catch {
          // ignore
        }
      })
      .catch((err: unknown) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Booking failed");
      });
  }, [tid, legacyBookingId]);

  if (status === "finalizing") {
    return (
      <div className="max-w-[640px] mx-auto flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-5 animate-pulse">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-[24px] font-bold text-text mb-2 tracking-tight">
          Finalizing your booking
        </h1>
        <p className="text-text-muted text-base">
          Payment received. Confirming with the hotel — please don&apos;t close this page.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-[640px] mx-auto flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <Warning size={32} weight="fill" className="text-red-500" />
        </div>
        <h1 className="text-[24px] font-bold text-text mb-3 tracking-tight">
          We couldn&apos;t finalize your booking
        </h1>
        <p className="text-text-muted text-base mb-6 max-w-[480px]">
          Your payment was processed but the booking didn&apos;t complete. Please contact support
          with the details below.
        </p>
        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-[16px] p-4 text-sm text-red-700 text-left mb-6 break-all">
            {error}
          </div>
        )}
        {tid && (
          <p className="text-xs text-text-muted mb-6">
            Transaction reference: <span className="font-mono">{tid}</span>
          </p>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-brand text-white rounded-[14px] px-8 py-3.5 font-semibold text-sm hover:bg-brand-dark transition-colors"
        >
          Back to home
        </Link>
      </div>
    );
  }

  // success or idle (no tid, no bookingId — direct visit)
  return (
    <div className="max-w-[640px] mx-auto flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-5">
        <CheckCircle size={32} weight="fill" className="text-success" />
      </div>

      <h1 className="text-[28px] font-bold text-text mb-3 tracking-tight">Booking confirmed</h1>
      <p className="text-text-muted text-base mb-8 max-w-[440px]">
        Your booking is confirmed. A confirmation email has been sent to your email address with all
        the details.
      </p>

      <div className="w-full bg-white border border-border rounded-[20px] p-7 text-left flex flex-col gap-4 mb-8">
        {bookingId && (
          <div className="flex justify-between items-start text-sm pb-4 border-b border-border">
            <span className="text-text-muted">Booking reference</span>
            <span className="font-semibold text-text font-mono text-xs bg-surface px-2.5 py-1 rounded-lg">
              {bookingId}
            </span>
          </div>
        )}
        {details.hotel && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Hotel</span>
            <span className="font-semibold text-text text-right max-w-[280px]">{details.hotel}</span>
          </div>
        )}
        {details.room && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Room</span>
            <span className="font-medium text-text text-right max-w-[280px]">{details.room}</span>
          </div>
        )}
        {details.checkin && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Check-in</span>
            <span className="font-medium text-text">{formatDate(details.checkin)}</span>
          </div>
        )}
        {details.checkout && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-muted">Check-out</span>
            <span className="font-medium text-text">{formatDate(details.checkout)}</span>
          </div>
        )}
        {details.price > 0 && (
          <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-border">
            <span className="text-text">Total paid</span>
            <span className="text-text text-base">
              {formatCurrency(details.price, details.currency)}
            </span>
          </div>
        )}
      </div>

      <Link
        href="/"
        className="inline-flex items-center justify-center bg-brand text-white rounded-[14px] px-8 py-3.5 font-semibold text-sm hover:bg-brand-dark transition-colors"
      >
        Search more hotels
      </Link>
    </div>
  );
}
