import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getRates } from "@/lib/liteapi";

function buildCacheKey(body: Record<string, unknown>): string {
  const placeId = body.placeId as string | undefined;
  const cityName = body.cityName as string | undefined;
  const checkin = body.checkin as string;
  const checkout = body.checkout as string;
  const occupancies = body.occupancies as { adults: number }[] | undefined;
  const adults = occupancies?.[0]?.adults ?? 2;
  const currency = (body.currency as string | undefined) ?? "USD";
  return `${placeId ?? cityName ?? "unknown"}-${checkin}-${checkout}-${adults}-${currency}`;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hasCheckin = Boolean(body.checkin);
  const hasCheckout = Boolean(body.checkout);
  const hasOccupancies = Boolean(body.occupancies);
  const hasHotelIds = Boolean(body.hotelIds);
  const hasPlaceId = Boolean(body.placeId);
  const hasCityName = Boolean(body.cityName);

  if (!hasCheckin || !hasCheckout || !hasOccupancies) {
    return NextResponse.json(
      { error: "checkin, checkout, and occupancies are required" },
      { status: 400 }
    );
  }

  if (!hasHotelIds && !hasPlaceId && !hasCityName) {
    return NextResponse.json(
      { error: "At least one of hotelIds, placeId, or cityName is required" },
      { status: 400 }
    );
  }

  const cacheKey = buildCacheKey(body);

  const getCachedRates = unstable_cache(
    async (b: Parameters<typeof getRates>[0]) => getRates(b),
    ["rates", cacheKey],
    { revalidate: 300 } // 5 minutes
  );

  try {
    const data = await getCachedRates(body as Parameters<typeof getRates>[0]);
    const response = NextResponse.json(data);
    // Also set Cache-Control so Vercel edge can cache the response
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
