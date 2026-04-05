import { NextRequest } from "next/server";

export const runtime = "edge";

const DATA_BASE_URL = "https://api.liteapi.travel/v3.0";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hasCheckin = Boolean(body.checkin);
  const hasCheckout = Boolean(body.checkout);
  const hasOccupancies = Boolean(body.occupancies);
  const hasHotelIds = Boolean(body.hotelIds);
  const hasPlaceId = Boolean(body.placeId);
  const hasCityName = Boolean(body.cityName);

  if (!hasCheckin || !hasCheckout || !hasOccupancies) {
    return new Response(
      JSON.stringify({ error: "checkin, checkout, and occupancies are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!hasHotelIds && !hasPlaceId && !hasCityName) {
    return new Response(
      JSON.stringify({ error: "At least one of hotelIds, placeId, or cityName is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.LITEAPI_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "LITEAPI_KEY environment variable is not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let liteResponse: Response;
  try {
    liteResponse = await fetch(`${DATA_BASE_URL}/hotels/rates`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ ...body, stream: true, timeout: 15 }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!liteResponse.ok || !liteResponse.body) {
    return new Response(
      JSON.stringify({ error: `LiteAPI error: ${liteResponse.status} ${liteResponse.statusText}` }),
      { status: liteResponse.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check if LiteAPI returned SSE or plain JSON
  const contentType = liteResponse.headers.get("content-type") ?? "";
  if (!contentType.includes("text/event-stream")) {
    // LiteAPI returned JSON instead of a stream — proxy it as a single SSE event
    // so the client-side reader can handle it uniformly
    const json = await liteResponse.text();
    const sseBody = `data: ${json}\n\ndata: [DONE]\n\n`;
    return new Response(sseBody, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  }

  // Forward the SSE stream directly
  return new Response(liteResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
