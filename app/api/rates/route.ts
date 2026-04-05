import { NextRequest, NextResponse } from "next/server";
import { getRates } from "@/lib/liteapi";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.checkin || !body.checkout || !body.occupancies) {
    return NextResponse.json(
      { error: "checkin, checkout, and occupancies are required" },
      { status: 400 }
    );
  }

  if (!body.hotelIds && !body.placeId && !body.cityName) {
    return NextResponse.json(
      { error: "At least one of hotelIds, placeId, or cityName is required" },
      { status: 400 }
    );
  }

  try {
    const data = await getRates(body as Parameters<typeof getRates>[0]);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
