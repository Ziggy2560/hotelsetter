import type { Metadata } from "next";
import { getHotelDetail, getReviews } from "@/lib/liteapi";
import Navbar from "@/components/layout/navbar";
import PhotoGallery from "@/components/hotel/photo-gallery";
import HotelHeader from "@/components/hotel/hotel-header";
import AmenitiesGrid from "@/components/hotel/amenities-grid";
import ReviewsSection from "@/components/hotel/reviews-section";
import RoomRatesClient from "@/components/hotel/room-rates-client";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}): Promise<Metadata> {
  const { hotelId } = await params;
  try {
    const response = await getHotelDetail(hotelId);
    const hotel = response.data;
    return {
      title: `${hotel.name} — HotelSetter`,
      description: hotel.hotelDescription?.slice(0, 160),
    };
  } catch {
    return {
      title: "Hotel — HotelSetter",
    };
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { hotelId } = await params;
  const sp = await searchParams;

  const checkin = sp.checkin ?? "";
  const checkout = sp.checkout ?? "";
  const adults = sp.adults ? Number(sp.adults) : 2;

  // Fetch hotel detail + reviews in parallel
  const [detailResponse, reviewsResponse] = await Promise.allSettled([
    getHotelDetail(hotelId),
    getReviews(hotelId),
  ]);

  if (detailResponse.status === "rejected") {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar variant="solid" />
        <div className="max-w-[1320px] mx-auto px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-text mb-3">Hotel not found</h1>
          <p className="text-text-muted text-sm">
            We could not load details for this hotel. Please go back and try again.
          </p>
        </div>
      </div>
    );
  }

  const hotel = detailResponse.value.data;
  const reviews = reviewsResponse.status === "fulfilled" ? reviewsResponse.value.data : [];

  // Compute aggregate rating from reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : undefined;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar variant="solid" />

      <main className="max-w-[1320px] mx-auto px-8 py-8">
        {/* Photo gallery — full width */}
        {hotel.hotelImages && hotel.hotelImages.length > 0 && (
          <div className="mb-8">
            <PhotoGallery images={hotel.hotelImages} hotelName={hotel.name} />
          </div>
        )}

        {/*
          Two-column layout:
          Left  → hotel info, description, amenities, rooms, reviews
          Right → sticky booking sidebar (managed inside RoomRatesClient)

          RoomRatesClient renders [rooms column] + [sidebar column] as a
          CSS grid row. We embed it inside a grid that spans cols 1–2.
        */}
        <div className="grid grid-cols-[1fr_380px] gap-10 items-start">
          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-10 min-w-0">
            {/* Header */}
            <HotelHeader
              hotel={hotel}
              rating={avgRating}
              reviewCount={reviews.length}
            />

            {/* Description */}
            {hotel.hotelDescription && (
              <section>
                <h2 className="text-xl font-bold text-text mb-3">About this hotel</h2>
                <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line">
                  {hotel.hotelDescription}
                </p>
              </section>
            )}

            {/* Important info */}
            {hotel.hotelImportantInformation && (
              <section className="bg-amber-50 border border-amber-100 rounded-[16px] p-5">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">
                  Important information
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  {hotel.hotelImportantInformation}
                </p>
              </section>
            )}

            {/* Amenities */}
            {hotel.hotelFacilities && hotel.hotelFacilities.length > 0 && (
              <AmenitiesGrid facilities={hotel.hotelFacilities} />
            )}

            {/* Reviews */}
            <ReviewsSection reviews={reviews} />
          </div>

          {/* ── Right column: placeholder — sidebar rendered in RoomRatesClient ── */}
          <div />
        </div>

        {/*
          Room rates + booking sidebar span the full container width, rendered
          as their own two-column grid matching the layout above. The client
          component owns both columns so it can share selected-room state.
        */}
        <div className="mt-10">
          <div className="grid grid-cols-[1fr_380px] gap-10 items-start">
            <RoomRatesClient
              hotelId={hotelId}
              hotelName={hotel.name}
              checkin={checkin}
              checkout={checkout}
              adults={adults}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
