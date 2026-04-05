import { Skeleton } from "@/components/ui/skeleton";

function SkeletonHotelCard() {
  return (
    <div className="bg-white border border-border rounded-[20px] overflow-hidden grid grid-cols-[280px_1fr]">
      {/* Image skeleton */}
      <Skeleton className="min-h-[220px] w-full rounded-none" />

      {/* Content skeleton */}
      <div className="p-5 flex flex-col gap-3">
        {/* Stars */}
        <Skeleton className="h-3 w-20" />
        {/* Name */}
        <Skeleton className="h-6 w-3/4" />
        {/* Location */}
        <Skeleton className="h-4 w-1/2" />
        {/* Tags */}
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom row */}
        <div className="flex items-end justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-[10px]" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 bg-surface/85 backdrop-blur border-b border-border h-16 flex items-center">
        <div className="max-w-[1320px] mx-auto px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm leading-none">H</span>
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="bg-white border-b border-border py-4">
        <div className="max-w-[1320px] mx-auto px-8">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1320px] mx-auto px-8 py-8">
        <div className="flex gap-8 items-start">
          {/* Sidebar skeleton */}
          <aside className="w-[280px] shrink-0 flex flex-col gap-5">
            <Skeleton className="h-6 w-32" />
            {/* Filter sections */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </aside>

          {/* Results skeleton */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonHotelCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
