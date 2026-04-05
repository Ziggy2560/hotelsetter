"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface GuestFormProps {
  onComplete: (data: GuestData) => void;
}

export function GuestForm({ onComplete }: GuestFormProps) {
  const [completed, setCompleted] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof GuestData, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof GuestData, string>> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const data: GuestData = { firstName, lastName, email, phone };
    setGuestData(data);
    setCompleted(true);
    onComplete(data);
  }

  function handleEdit() {
    setCompleted(false);
  }

  const inputClass = cn(
    "w-full border border-black/10 rounded-xl px-4 py-3.5 text-sm text-text bg-white",
    "placeholder:text-text-muted",
    "focus:outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(0,122,255,0.08)]",
    "transition-all"
  );

  const labelClass = "block text-sm font-medium text-text mb-1.5";

  if (completed && guestData) {
    return (
      <div className="bg-white border border-border rounded-[20px] p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text mb-1">Guest details</h2>
            <p className="text-sm text-text-muted">
              {guestData.firstName} {guestData.lastName} &middot; {guestData.email} &middot; {guestData.phone}
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="text-sm text-brand font-medium hover:opacity-70 transition-opacity"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-[20px] p-8">
      <h2 className="text-lg font-semibold text-text mb-6">Guest details</h2>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className={cn(inputClass, errors.firstName && "border-red-400")}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              className={cn(inputClass, errors.lastName && "border-red-400")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={cn(inputClass, errors.email && "border-red-400")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
            className={cn(inputClass, errors.phone && "border-red-400")}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <button
          type="submit"
          className="mt-1 w-full bg-brand text-white rounded-[14px] py-3.5 font-semibold text-sm hover:bg-brand-dark transition-colors"
        >
          Continue to payment
        </button>
      </form>
    </div>
  );
}
