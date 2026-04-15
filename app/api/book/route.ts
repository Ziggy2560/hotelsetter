import { NextRequest, NextResponse } from "next/server";
import { book } from "@/lib/liteapi";
import type { BookRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.prebookId || !body.holder || !body.guests || !body.payment) {
    return NextResponse.json(
      { error: "prebookId, holder, guests, and payment are required" },
      { status: 400 }
    );
  }

  const clientReference = (body.clientReference as string | undefined) ?? crypto.randomUUID();

  try {
    const bookRequest: BookRequest = {
      ...(body as Omit<BookRequest, "clientReference">),
      clientReference,
    };
    const data = await book(bookRequest);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/book] error", { message, body });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
