import { NextRequest, NextResponse } from "next/server";

const BOOK_BASE_URL = "https://book.liteapi.travel/v3.0";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const res = await fetch(`${BOOK_BASE_URL}/bookings?${params}`, {
    headers: {
      "X-API-Key": process.env.LITEAPI_KEY!,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to fetch bookings" }, { status: res.status });
  return NextResponse.json(await res.json());
}
