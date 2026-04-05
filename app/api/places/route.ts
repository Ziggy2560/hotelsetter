import { NextRequest, NextResponse } from "next/server";
import { getPlaces } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const textQuery = searchParams.get("textQuery");

  if (!textQuery) {
    return NextResponse.json({ error: "textQuery is required" }, { status: 400 });
  }

  try {
    const data = await getPlaces(textQuery);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
