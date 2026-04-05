"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant: "transparent" | "solid";
}

export default function Navbar({ variant }: NavbarProps) {
  return (
    <header
      className={cn(
        "z-50 w-full",
        variant === "transparent"
          ? "absolute top-0 left-0 text-white"
          : "sticky top-0 bg-surface/85 backdrop-blur border-b border-border text-text"
      )}
    >
      <div className="max-w-[1320px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm leading-none">H</span>
          </div>
          <span
            className={cn(
              "font-semibold text-[15px] tracking-tight",
              variant === "transparent" ? "text-white" : "text-text"
            )}
          >
            HotelSetter
          </span>
        </Link>

        {/* Spacer to keep logo left-aligned */}
        <div />
      </div>
    </header>
  );
}
