"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "./progress-bar";
import { GuestForm, type GuestData } from "./guest-form";
import { PaymentForm, type PaymentData } from "./payment-form";
import { OrderSummary } from "./order-summary";
import { PriceChangeModal } from "./price-change-modal";
import type { PrebookResponse } from "@/lib/types";

type CheckoutStep = "guest" | "payment" | "submitting";

interface CheckoutContentProps {
  searchParams: Record<string, string>;
}

export function CheckoutContent({ searchParams }: CheckoutContentProps) {
  const router = useRouter();

  const {
    offerId = "",
    hotelId = "",
    hotelName = "",
    roomName = "",
    checkin = "",
    checkout = "",
    adults = "1",
    price = "0",
    currency = "USD",
    nights = "1",
  } = searchParams;

  const priceNum = parseFloat(price) || 0;
  const adultsNum = parseInt(adults, 10) || 1;

  const [step, setStep] = useState<CheckoutStep>("guest");
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [prebookResponse, setPrebookResponse] = useState<PrebookResponse["data"] | null>(null);
  const [prebookLoading, setPrebookLoading] = useState(true);
  const [prebookError, setPrebookError] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);

  // Price change modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceModalDismissed, setPriceModalDismissed] = useState(false);

  // Run prebook on mount
  useEffect(() => {
    if (!offerId) {
      setPrebookLoading(false);
      setPrebookError("Missing offer ID. Please go back and select a room.");
      return;
    }

    async function runPrebook() {
      setPrebookLoading(true);
      try {
        const res = await fetch("/api/prebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId, usePaymentSdk: true }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Prebook failed");
        const data = (json as PrebookResponse).data;
        setPrebookResponse(data);

        // Check for price/policy changes
        if (
          (data.priceDifferencePercent > 0 ||
            data.cancellationChanged ||
            data.boardChanged) &&
          !priceModalDismissed
        ) {
          setShowPriceModal(true);
        }
      } catch (err) {
        setPrebookError(err instanceof Error ? err.message : "Prebook failed");
      } finally {
        setPrebookLoading(false);
      }
    }

    runPrebook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  function handleGuestComplete(data: GuestData) {
    setGuestData(data);
    setStep("payment");
  }

  async function handlePaymentSubmit(_paymentData: PaymentData) {
    if (!prebookResponse || !guestData) return;
    setStep("submitting");
    setBookError(null);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prebookId: prebookResponse.prebookId,
          holder: {
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            email: guestData.email,
            phone: guestData.phone,
          },
          guests: [
            {
              occupancyNumber: 1,
              firstName: guestData.firstName,
              lastName: guestData.lastName,
              email: guestData.email,
            },
          ],
          payment: {
            method: "TRANSACTION_ID",
            transactionId: prebookResponse.transactionId ?? "mock-transaction-id",
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Booking failed");

      const bookingId = json.data?.bookingId ?? "";
      const confirmParams = new URLSearchParams({
        bookingId,
        hotel: hotelName,
        room: roomName,
        checkin,
        checkout,
        price: String(prebookResponse.price ?? priceNum),
        currency: prebookResponse.currency ?? currency,
      });

      router.push(`/booking/confirmation?${confirmParams.toString()}`);
    } catch (err) {
      setBookError(err instanceof Error ? err.message : "Booking failed. Please try again.");
      setStep("payment");
    }
  }

  function handleModalGoBack() {
    router.back();
  }

  function handleModalContinue() {
    setShowPriceModal(false);
    setPriceModalDismissed(true);
  }

  // Effective price (may be updated after prebook)
  const effectivePrice = prebookResponse?.price ?? priceNum;
  const effectiveCurrency = prebookResponse?.currency ?? currency;

  // Step index for progress bar
  const stepIndex = step === "guest" ? 0 : step === "payment" ? 1 : 1;

  return (
    <main className="bg-surface min-h-screen py-10">
      <div className="max-w-[1320px] mx-auto px-8">
        <ProgressBar currentStep={stepIndex} />

        <div className="grid grid-cols-[1fr_400px] gap-12 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Prebook loading / error banner */}
            {prebookLoading && (
              <div className="bg-white border border-border rounded-[20px] p-6 text-sm text-text-muted animate-pulse">
                Securing your rate...
              </div>
            )}
            {prebookError && (
              <div className="bg-red-50 border border-red-200 rounded-[20px] p-6 text-sm text-red-600">
                {prebookError}
              </div>
            )}

            {/* Step 1: Guest details */}
            <GuestForm onComplete={handleGuestComplete} />

            {/* Step 2: Payment (only rendered once guest details complete) */}
            {(step === "payment" || step === "submitting") && (
              <>
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  isSubmitting={step === "submitting"}
                />
                {bookError && (
                  <div className="bg-red-50 border border-red-200 rounded-[16px] px-4 py-3 text-sm text-red-600">
                    {bookError}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right column — order summary */}
          <OrderSummary
            hotelName={hotelName}
            roomName={roomName}
            checkin={checkin}
            checkout={checkout}
            adults={adultsNum}
            price={effectivePrice}
            currency={effectiveCurrency}
            nights={parseInt(nights, 10) || 1}
          />
        </div>
      </div>

      {/* Price change modal */}
      {prebookResponse && showPriceModal && (
        <PriceChangeModal
          open={showPriceModal}
          oldPrice={priceNum}
          newPrice={prebookResponse.price}
          currency={effectiveCurrency}
          cancellationChanged={prebookResponse.cancellationChanged}
          boardChanged={prebookResponse.boardChanged}
          onGoBack={handleModalGoBack}
          onContinue={handleModalContinue}
        />
      )}
    </main>
  );
}
