import { NextRequest, NextResponse } from "next/server";
import { getHotels } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const hasPlaceId = searchParams.has("placeId");
  const hasCityName = searchParams.has("cityName");
  const hasLatitude = searchParams.has("latitude");

  if (!hasPlaceId && !hasCityName && !hasLatitude) {
    return NextResponse.json(
      { error: "At least one of placeId, cityName, or latitude is required" },
      { status: 400 }
    );
  }

  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    const data = await getHotels(params);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
