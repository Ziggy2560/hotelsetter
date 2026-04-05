import { NextRequest, NextResponse } from "next/server";
import { getReviews } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hotelId = searchParams.get("hotelId");

  if (!hotelId) {
    return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
  }

  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  try {
    const data = await getReviews(hotelId, limit);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
