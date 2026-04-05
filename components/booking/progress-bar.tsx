"use client";

import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const STEPS = ["Guest details", "Payment", "Confirmation"];

interface ProgressBarProps {
  currentStep: number; // 0-indexed
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-center max-w-[480px] mx-auto mb-10">
      {STEPS.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;

        return (
          <div key={label} className="flex items-center">
            {/* connector line before each step (except first) */}
            {i > 0 && (
              <div
                className={cn(
                  "w-16 h-px mx-2",
                  i <= currentStep ? "bg-success" : "bg-black/10"
                )}
              />
            )}

            <div className="flex flex-col items-center gap-1.5">
              {/* circle */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors",
                  done &&
                    "bg-success border-success text-white",
                  active &&
                    "bg-brand border-brand text-white",
                  !done &&
                    !active &&
                    "bg-white border-black/20 text-text-muted"
                )}
              >
                {done ? <Check size={14} weight="bold" /> : i + 1}
              </div>
              {/* label */}
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  done && "text-success",
                  active && "text-brand",
                  !done && !active && "text-text-muted"
                )}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
