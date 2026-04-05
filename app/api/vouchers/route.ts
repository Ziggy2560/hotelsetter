import { NextRequest, NextResponse } from "next/server";

const DA_BASE_URL = "https://da.liteapi.travel";

function getApiKey(): string {
  const key = process.env.LITEAPI_KEY;
  if (!key) throw new Error("LITEAPI_KEY environment variable is not set");
  return key;
}

function defaultHeaders() {
  return {
    "X-API-Key": getApiKey(),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** GET /api/vouchers — list all vouchers */
export async function GET() {
  try {
    const upstream = await fetch(`${DA_BASE_URL}/vouchers`, {
      method: "GET",
      headers: defaultHeaders(),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/vouchers — create a voucher */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const upstream = await fetch(`${DA_BASE_URL}/vouchers`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
