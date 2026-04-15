import { NextRequest, NextResponse } from "next/server";
import { getMinRates } from "@/lib/liteapi";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { hotelIds, checkin, checkout, occupancies, currency, guestNationality } = body as {
    hotelIds?: string[];
    checkin?: string;
    checkout?: string;
    occupancies?: { adults: number; children?: number[] }[];
    currency?: string;
    guestNationality?: string;
  };

  if (!hotelIds?.length || !checkin || !checkout || !occupancies) {
    return NextResponse.json(
      { error: "hotelIds, checkin, checkout, and occupancies are required" },
      { status: 400 }
    );
  }

  try {
    const data = await getMinRates({
      hotelIds,
      checkin,
      checkout,
      occupancies,
      currency: currency ?? "AUD",
      guestNationality: guestNationality ?? "AU",
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
