import { NextRequest, NextResponse } from "next/server";
import { prebook } from "@/lib/liteapi";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.offerId) {
    return NextResponse.json({ error: "offerId is required" }, { status: 400 });
  }

  try {
    const data = await prebook({
      offerId: body.offerId as string,
      usePaymentSdk: body.usePaymentSdk ?? true,
      ...(body.voucherCode !== undefined && { voucherCode: body.voucherCode }),
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
