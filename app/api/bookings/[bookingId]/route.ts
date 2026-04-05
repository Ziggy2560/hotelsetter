import { NextRequest, NextResponse } from "next/server";

const BOOK_BASE_URL = "https://book.liteapi.travel/v3.0";

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const res = await fetch(`${BOOK_BASE_URL}/bookings/${bookingId}`, {
    headers: {
      "X-API-Key": process.env.LITEAPI_KEY!,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch booking" }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const res = await fetch(`${BOOK_BASE_URL}/bookings/${bookingId}`, {
    method: "PUT",
    headers: {
      "X-API-Key": process.env.LITEAPI_KEY!,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to cancel booking" }, { status: res.status });
  return NextResponse.json(await res.json());
}
