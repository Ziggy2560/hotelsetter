"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

interface PriceChangeModalProps {
  open: boolean;
  oldPrice: number;
  newPrice: number;
  currency: string;
  cancellationChanged: boolean;
  boardChanged: boolean;
  onGoBack: () => void;
  onContinue: () => void;
}

export function PriceChangeModal({
  open,
  oldPrice,
  newPrice,
  currency,
  cancellationChanged,
  boardChanged,
  onGoBack,
  onContinue,
}: PriceChangeModalProps) {
  const diff = newPrice - oldPrice;
  const priceDiff = formatCurrency(Math.abs(diff), currency);

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-text">
            Price has changed
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted mt-1">
            The price for this room has been updated since you selected it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 my-2">
          {/* Price comparison */}
          <div className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-1">
                Original price
              </p>
              <p className="text-base font-bold text-text line-through">
                {formatCurrency(oldPrice, currency)}
              </p>
            </div>
            <div className="text-text-muted text-xl">→</div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-1">
                New price
              </p>
              <p className="text-base font-bold text-text">
                {formatCurrency(newPrice, currency)}
              </p>
            </div>
          </div>

          {/* Change summary */}
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={
                  diff > 0 ? "text-red-500" : "text-success"
                }
              >
                {diff > 0 ? `▲ ${priceDiff} more` : `▼ ${priceDiff} less`}
              </span>
              <span className="text-text-muted">than originally shown</span>
            </div>
            {cancellationChanged && (
              <p className="text-amber-600 text-xs">
                The cancellation policy has also changed.
              </p>
            )}
            {boardChanged && (
              <p className="text-amber-600 text-xs">
                The board / meal plan has also changed.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={onGoBack}
            className="flex-1 border border-border rounded-[12px] py-3 text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Go back
          </button>
          <button
            onClick={onContinue}
            className="flex-1 bg-brand text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-brand-dark transition-colors"
          >
            Continue anyway
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
