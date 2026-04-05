import { NextRequest, NextResponse } from "next/server";

const DA_BASE_URL = "https://da.liteapi.travel";

function getApiKey(): string {
  const key = process.env.LITEAPI_KEY;
  if (!key) throw new Error("LITEAPI_KEY environment variable is not set");
  return key;
}

const ENDPOINT_MAP: Record<string, string> = {
  report: "/analytics/report",
  weekly: "/analytics/weekly",
  markets: "/analytics/markets",
  hotels: "/analytics/hotels",
};

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "report";

  const path = ENDPOINT_MAP[type];
  if (!path) {
    return NextResponse.json(
      { error: `Unknown analytics type: "${type}". Valid values: ${Object.keys(ENDPOINT_MAP).join(", ")}` },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const upstream = await fetch(`${DA_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "X-API-Key": getApiKey(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
