"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface PaymentData {
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  specialRequests: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentData) => void;
  isSubmitting?: boolean;
}

export function PaymentForm({ onSubmit, isSubmitting = false }: PaymentFormProps) {
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const inputClass = cn(
    "w-full border border-black/10 rounded-xl px-4 py-3.5 text-sm text-text bg-white",
    "placeholder:text-text-muted",
    "focus:outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(0,122,255,0.08)]",
    "transition-all"
  );
  const labelClass = "block text-sm font-medium text-text mb-1.5";

  function formatCardNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  function validate(): boolean {
    const newErrors: Partial<Record<string, string>> = {};
    if (!nameOnCard.trim()) newErrors.nameOnCard = "Name on card is required";
    const rawCard = cardNumber.replace(/\s/g, "");
    if (!rawCard) {
      newErrors.cardNumber = "Card number is required";
    } else if (rawCard.length < 13) {
      newErrors.cardNumber = "Enter a valid card number";
    }
    if (!expiry.trim()) {
      newErrors.expiry = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Enter expiry as MM/YY";
    }
    if (!cvc.trim()) {
      newErrors.cvc = "CVC is required";
    } else if (cvc.length < 3) {
      newErrors.cvc = "Enter a valid CVC";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ nameOnCard, cardNumber, expiry, cvc, specialRequests });
  }

  return (
    <div className="bg-white border border-border rounded-[20px] p-8">
      <h2 className="text-lg font-semibold text-text mb-6">Payment details</h2>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Name on card */}
        <div>
          <label className={labelClass}>Name on card</label>
          <input
            type="text"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            placeholder="John Smith"
            className={cn(inputClass, errors.nameOnCard && "border-red-400")}
          />
          {errors.nameOnCard && (
            <p className="text-xs text-red-500 mt-1">{errors.nameOnCard}</p>
          )}
        </div>

        {/* Card number */}
        <div>
          <label className={labelClass}>Card number</label>
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className={cn(inputClass, errors.cardNumber && "border-red-400")}
          />
          {errors.cardNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry + CVC row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Expiry date</label>
            <input
              type="text"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className={cn(inputClass, errors.expiry && "border-red-400")}
            />
            {errors.expiry && (
              <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>CVC</label>
            <input
              type="text"
              inputMode="numeric"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              className={cn(inputClass, errors.cvc && "border-red-400")}
            />
            {errors.cvc && (
              <p className="text-xs text-red-500 mt-1">{errors.cvc}</p>
            )}
          </div>
        </div>

        {/* Special requests */}
        <div>
          <label className={labelClass}>
            Special requests{" "}
            <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="E.g. early check-in, high floor, twin beds..."
            rows={3}
            className={cn(
              inputClass,
              "resize-none"
            )}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full bg-brand text-white rounded-[16px] py-4 font-bold text-base hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Confirm & pay"}
        </button>
        <p className="text-xs text-text-muted text-center -mt-2">
          By confirming, you agree to the hotel&apos;s cancellation policy and HotelSetter&apos;s terms of service.
        </p>
      </form>
    </div>
  );
}
