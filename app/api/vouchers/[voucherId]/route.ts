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

type RouteContext = { params: Promise<{ voucherId: string }> };

/** GET /api/vouchers/[voucherId] — get a single voucher */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { voucherId } = await params;
  try {
    const upstream = await fetch(`${DA_BASE_URL}/vouchers/${voucherId}`, {
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

/** PUT /api/vouchers/[voucherId] — update a voucher */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { voucherId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const upstream = await fetch(`${DA_BASE_URL}/vouchers/${voucherId}`, {
      method: "PUT",
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

/** DELETE /api/vouchers/[voucherId] — delete a voucher */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { voucherId } = await params;

  try {
    const upstream = await fetch(`${DA_BASE_URL}/vouchers/${voucherId}`, {
      method: "DELETE",
      headers: defaultHeaders(),
    });

    // DELETE may return 204 with no body
    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
