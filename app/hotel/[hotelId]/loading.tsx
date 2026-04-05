import { Skeleton } from "@/components/ui/skeleton";

function SkeletonRoomCard() {
  return (
    <div className="bg-white border border-border rounded-[20px] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export default function HotelDetailLoading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
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

      <main className="max-w-[1320px] mx-auto px-8 py-8">
        {/* Photo gallery skeleton — 5 rectangles in grid layout */}
        <div className="mb-8 grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-[20px] overflow-hidden">
          {/* Main large image */}
          <Skeleton className="col-span-2 row-span-2 rounded-none" />
          {/* Four smaller images */}
          <Skeleton className="rounded-none" />
          <Skeleton className="rounded-none" />
          <Skeleton className="rounded-none" />
          <Skeleton className="rounded-none" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-[1fr_380px] gap-10 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            {/* Hotel name + address */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-3.5 h-3.5 rounded-sm" />
                ))}
              </div>
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex gap-2 mt-1">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Amenities */}
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-36 mb-1" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — sidebar skeleton */}
          <div className="sticky top-24 bg-white border border-border rounded-[20px] p-6 flex flex-col gap-5">
            <Skeleton className="h-6 w-32" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex justify-between mt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Room cards skeleton */}
        <div className="mt-10">
          <div className="grid grid-cols-[1fr_380px] gap-10 items-start">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-7 w-40 mb-2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRoomCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
