import type {
  PlacesResponse,
  HotelsResponse,
  HotelDetailResponse,
  ReviewsResponse,
  RatesResponse,
  PrebookResponse,
  BookRequest,
  BookResponse,
} from "@/lib/types";

const DATA_BASE_URL = "https://api.liteapi.travel/v3.0";
const BOOK_BASE_URL = "https://book.liteapi.travel/v3.0";

function getApiKey(): string {
  const key = process.env.LITEAPI_KEY;
  if (!key) throw new Error("LITEAPI_KEY environment variable is not set");
  return key;
}

function defaultHeaders(): Record<string, string> {
  return {
    "X-API-Key": getApiKey(),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
      );
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }

    if (response.status === 429 && attempt < retries) {
      lastError = new Error(`Rate limited (429) on ${url}`);
      continue;
    }

    return response;
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${retries} retries`);
}

// ─── Places ──────────────────────────────────────────────────────────────────

export async function getPlaces(textQuery: string): Promise<PlacesResponse> {
  const url = `${DATA_BASE_URL}/data/places?textQuery=${encodeURIComponent(textQuery)}`;
  const res = await fetchWithRetry(url, { headers: defaultHeaders() });

  if (!res.ok) {
    throw new Error(
      `getPlaces failed: ${res.status} ${res.statusText} for query "${textQuery}"`
    );
  }

  return res.json() as Promise<PlacesResponse>;
}

// ─── Hotels ──────────────────────────────────────────────────────────────────

export async function getHotels(
  params: Record<string, string>
): Promise<HotelsResponse> {
  const qs = new URLSearchParams(params).toString();
  const url = `${DATA_BASE_URL}/data/hotels?${qs}`;
  const res = await fetchWithRetry(url, { headers: defaultHeaders() });

  if (!res.ok) {
    throw new Error(
      `getHotels failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<HotelsResponse>;
}

// ─── Hotel Detail ─────────────────────────────────────────────────────────────

export async function getHotelDetail(
  hotelId: string
): Promise<HotelDetailResponse> {
  const url = `${DATA_BASE_URL}/data/hotel?hotelId=${encodeURIComponent(hotelId)}`;
  const res = await fetchWithRetry(url, { headers: defaultHeaders() });

  if (!res.ok) {
    throw new Error(
      `getHotelDetail failed: ${res.status} ${res.statusText} for hotelId "${hotelId}"`
    );
  }

  return res.json() as Promise<HotelDetailResponse>;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getReviews(
  hotelId: string,
  limit = 20
): Promise<ReviewsResponse> {
  const url = `${DATA_BASE_URL}/data/reviews?hotelId=${encodeURIComponent(hotelId)}&limit=${limit}`;
  const res = await fetchWithRetry(url, { headers: defaultHeaders() });

  if (!res.ok) {
    throw new Error(
      `getReviews failed: ${res.status} ${res.statusText} for hotelId "${hotelId}"`
    );
  }

  return res.json() as Promise<ReviewsResponse>;
}

// ─── Rates ───────────────────────────────────────────────────────────────────

export async function getRates(body: {
  hotelIds: string[];
  checkin: string;
  checkout: string;
  occupancies: { adults: number; children: number[] }[];
  currency: string;
  guestNationality: string;
  [key: string]: unknown;
}): Promise<RatesResponse> {
  const url = `${DATA_BASE_URL}/hotels/rates`;
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: defaultHeaders(),
    body: JSON.stringify({ ...body, timeout: 10 }),
  });

  if (!res.ok) {
    throw new Error(`getRates failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<RatesResponse>;
}

// ─── Prebook ─────────────────────────────────────────────────────────────────

export async function prebook(body: {
  offerId: string;
  [key: string]: unknown;
}): Promise<PrebookResponse> {
  const url = `${BOOK_BASE_URL}/rates/prebook`;
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: defaultHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`prebook failed: ${res.status} ${res.statusText} — ${text}`);
  }

  return res.json() as Promise<PrebookResponse>;
}

// ─── Min-Rates ────────────────────────────────────────────────────────────────

export async function getMinRates(body: {
  hotelIds: string[];
  checkin: string;
  checkout: string;
  occupancies: { adults: number; children?: number[] }[];
  currency: string;
  guestNationality: string;
}) {
  const url = `${DATA_BASE_URL}/hotels/min-rates`;
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: defaultHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Min-rates API error: ${res.status}`);
  return res.json();
}

// ─── Book ─────────────────────────────────────────────────────────────────────

export async function book(body: BookRequest): Promise<BookResponse> {
  const url = `${BOOK_BASE_URL}/rates/book`;
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: defaultHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`book failed: ${res.status} ${res.statusText} — ${text}`);
  }

  return res.json() as Promise<BookResponse>;
}
