"use client";

import { useState } from "react";
import type { Review } from "@/lib/types";
import { getRatingLabel } from "@/lib/utils";

interface ReviewsSectionProps {
  reviews: Review[];
}

function ReviewAvatar({ name }: { name?: string }) {
  const initial = name && name.trim().length > 0 ? name.trim()[0].toUpperCase() : "G";
  return (
    <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/15 flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-brand">{initial}</span>
    </div>
  );
}

function formatReviewDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-bold text-text mb-4">Guest reviews</h2>
        <p className="text-text-muted text-sm">No reviews yet for this property.</p>
      </section>
    );
  }

  // Compute average rating
  const totalRating = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
  const avgRating = totalRating / reviews.length;
  const ratingLabel = getRatingLabel(avgRating);

  return (
    <section>
      <h2 className="text-xl font-bold text-text mb-5">Guest reviews</h2>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-white border border-border rounded-[16px]">
        <div className="w-16 h-16 rounded-[14px] bg-brand flex items-center justify-center shrink-0">
          <span className="text-[28px] font-bold text-white leading-none">
            {avgRating.toFixed(1)}
          </span>
        </div>
        <div>
          <p className="text-lg font-bold text-text leading-tight">{ratingLabel}</p>
          <p className="text-sm text-text-muted mt-0.5">
            Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Review list */}
      <ReviewsList reviews={reviews} />
    </section>
  );
}

function ReviewsList({ reviews }: { reviews: Review[] }) {
  const MAX_VISIBLE = 3;
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, MAX_VISIBLE);
  const remaining = reviews.length - MAX_VISIBLE;

  return (
    <>
      <div className="flex flex-col gap-4">
        {visible.map((review, i) => (
          <article
            key={i}
            className="bg-white border border-border rounded-[16px] p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <ReviewAvatar name={review.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text truncate">
                    {review.name && review.name.trim().length > 0
                      ? review.name
                      : "Anonymous Guest"}
                  </p>
                  <span className="w-8 h-8 rounded-[8px] bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {(review.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {review.date ? formatReviewDate(review.date) : ""}
                  {review.travellerType ? ` · ${review.travellerType}` : ""}
                </p>
              </div>
            </div>

            {review.title && (
              <p className="text-sm font-semibold text-text mb-1">{review.title}</p>
            )}
            {review.text && (
              <p className="text-sm text-text-muted leading-relaxed line-clamp-4">
                {review.text}
              </p>
            )}
          </article>
        ))}
      </div>
      {remaining > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-brand font-medium hover:underline"
        >
          {showAll ? "Show less" : `Show ${remaining} more reviews`}
        </button>
      )}
    </>
  );
}
