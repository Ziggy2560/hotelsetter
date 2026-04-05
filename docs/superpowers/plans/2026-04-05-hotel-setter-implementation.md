# Hotel Setter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully functional hotel booking platform at hotelsetter.com powered by LiteAPI v3.0, with search, filtering, hotel details, and checkout.

**Architecture:** Next.js 15 App Router with server components for SEO-critical hotel pages and client components for interactive search/checkout. All LiteAPI calls proxied through API routes to keep credentials server-side.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, LiteAPI v3.0, Vercel

---

## File Map

```
hotelsetter/
├── app/
│   ├── layout.tsx                        — Root layout: fonts, metadata, Navbar, Footer
│   ├── page.tsx                          — Homepage: Hero, SearchBar, Destinations, WhySection, CTA
│   ├── search/
│   │   └── page.tsx                      — Search results: client component wrapper
│   ├── hotel/
│   │   └── [hotelId]/
│   │       └── page.tsx                  — Hotel detail: server component (SSR)
│   ├── booking/
│   │   ├── page.tsx                      — Checkout: multi-step form
│   │   └── confirmation/
│   │       └── page.tsx                  — Booking confirmation
│   ├── api/
│   │   ├── places/route.ts              — Proxy: GET → /data/places
│   │   ├── hotels/route.ts              — Proxy: GET → /data/hotels
│   │   ├── hotel/route.ts               — Proxy: GET → /data/hotel
│   │   ├── reviews/route.ts             — Proxy: GET → /data/reviews
│   │   ├── rates/route.ts              — Proxy: POST → /hotels/rates
│   │   ├── prebook/route.ts            — Proxy: POST → /rates/prebook
│   │   └── book/route.ts               — Proxy: POST → /rates/book
│   └── globals.css                      — Tailwind v4 imports + custom CSS
├── components/
│   ├── layout/
│   │   ├── navbar.tsx                   — Navbar (transparent on hero, solid on other pages)
│   │   ├── footer.tsx                   — Footer with links
│   │   └── search-bar.tsx               — Reusable search bar (full + compact variants)
│   ├── home/
│   │   ├── hero.tsx                     — Hero section with background image
│   │   ├── popular-destinations.tsx     — Asymmetric destination grid
│   │   ├── why-section.tsx              — 4 feature cards
│   │   └── cta-banner.tsx              — Blue CTA banner
│   ├── search/
│   │   ├── search-page-content.tsx      — Client component: orchestrates filters + results
│   │   ├── filters-sidebar.tsx          — All filter controls
│   │   ├── hotel-card.tsx               — Horizontal hotel result card
│   │   ├── active-filters.tsx           — Dismissible filter chips
│   │   └── ai-search-bar.tsx            — Semantic search input
│   ├── hotel/
│   │   ├── photo-gallery.tsx            — 5-image grid with lightbox
│   │   ├── hotel-header.tsx             — Stars, name, address
│   │   ├── amenities-grid.tsx           — 2-col amenity icons
│   │   ├── room-card.tsx                — Room type with pricing + select
│   │   ├── reviews-section.tsx          — Review score + list
│   │   ├── booking-sidebar.tsx          — Sticky price + reserve CTA
│   │   └── room-rates-client.tsx        — Client wrapper for fetching rates
│   ├── booking/
│   │   ├── checkout-content.tsx         — Client component: multi-step form orchestration
│   │   ├── progress-bar.tsx             — 3-step indicator
│   │   ├── guest-form.tsx               — Guest details form
│   │   ├── payment-form.tsx             — Card payment form (LiteAPI SDK)
│   │   ├── order-summary.tsx            — Sticky sidebar summary
│   │   └── price-change-modal.tsx       — Warning modal for rate changes
│   └── ui/                              — shadcn components (customised)
├── lib/
│   ├── liteapi.ts                       — Server-side API client with retry logic
│   ├── types.ts                         — TypeScript interfaces for all API responses
│   ├── utils.ts                         — Formatters: currency, dates, board types, ratings
│   └── constants.ts                     — Board type labels, amenity icons, destination data
├── public/                              — Existing brand assets (logos, favicon)
├── .env.local                           — LITEAPI_KEY (git-ignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/globals.css`, `tailwind.config.ts`, `.env.local`, `app/layout.tsx`, `app/page.tsx`
- Modify: `.gitignore`

- [ ] **Step 1: Create Next.js project**

```bash
cd ~/Projects/hotelsetter
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=false --import-alias "@/*" --use-npm
```

Select: Yes to all defaults. This will scaffold into the existing directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install @phosphor-icons/react
npx shadcn@latest init
```

When prompted for shadcn init:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 3: Install shadcn components we'll need**

```bash
npx shadcn@latest add button input label select slider checkbox dialog sheet popover calendar command badge separator skeleton
```

- [ ] **Step 4: Create `.env.local`**

```env
LITEAPI_KEY=prod_1d36d274-1c0a-41da-ba76-f62d3f43ad6c
```

- [ ] **Step 5: Update `.gitignore`**

Add to the existing `.gitignore`:

```
.env.local
.superpowers/
```

- [ ] **Step 6: Configure `next.config.ts` for external images**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.bstatic.com" },
      { protocol: "https", hostname: "**.travelapi.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 7: Set up `app/globals.css` with brand tokens**

```css
@import "tailwindcss";

@theme {
  --color-brand: #007AFF;
  --color-brand-dark: #0066DD;
  --color-surface: #FAFAF8;
  --color-text: #1a1a1a;
  --color-text-muted: rgba(0, 0, 0, 0.45);
  --color-text-faint: rgba(0, 0, 0, 0.25);
  --color-border: rgba(0, 0, 0, 0.06);
  --color-success: #16a34a;
  --color-star: #f59e0b;
  --font-sans: "Outfit", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 20px;
  --radius-pill: 999px;
}
```

- [ ] **Step 8: Set up root layout with Outfit font**

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HotelSetter — Book Hotels That Feel Right",
  description:
    "Search 2M+ hotels worldwide. Real rates, instant confirmation, no hidden fees.",
  metadataBase: new URL("https://hotelsetter.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans bg-surface text-text antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Create placeholder homepage**

```typescript
// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center">
      <h1 className="text-4xl font-bold tracking-tight">HotelSetter</h1>
    </main>
  );
}
```

- [ ] **Step 10: Verify dev server runs**

```bash
npm run dev
```

Open http://localhost:3000 — should see "HotelSetter" centred on warm off-white background in Outfit font.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 project with Tailwind v4 + shadcn/ui"
```

---

### Task 2: TypeScript Types & Utilities

**Files:**
- Create: `lib/types.ts`, `lib/utils.ts`, `lib/constants.ts`

- [ ] **Step 1: Create API response types**

```typescript
// lib/types.ts

// === Places ===
export interface Place {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  types: string[];
  language: string;
}

export interface PlacesResponse {
  data: Place[];
}

// === Hotels ===
export interface Hotel {
  id: string;
  name: string;
  hotelDescription: string;
  currency: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  zip: string;
  main_photo: string;
  thumbnail: string;
  stars: number;
  hotelTypeId: number;
  chainId: number;
  chain: string;
  score: number;
  rating: number;
  reviewCount: number;
  facilityIds: number[];
}

export interface HotelsResponse {
  data: Hotel[];
  hotelIds: string[];
  total: number;
  place?: {
    placeId: string;
    displayName: string;
    location: { latitude: number; longitude: number };
  };
}

// === Hotel Detail ===
export interface HotelImage {
  url: string;
  urlHd: string;
  caption: string;
  order: number;
  defaultImage: boolean;
}

export interface HotelDetail {
  id: string;
  name: string;
  hotelDescription: string;
  hotelImportantInformation: string;
  checkinCheckoutTimes: {
    checkout: string;
    checkin_start: string;
    checkin_end: string;
    instructions: string[];
    special_instructions: string;
  };
  hotelImages: HotelImage[];
  main_photo: string;
  thumbnail: string;
  country: string;
  city: string;
  starRating: number;
  location: { latitude: number; longitude: number };
  address: string;
  hotelFacilities: string[];
}

export interface HotelDetailResponse {
  data: HotelDetail;
}

// === Reviews ===
export interface Review {
  title?: string;
  text: string;
  date: string;
  rating: number;
  travellerType?: string;
  name?: string;
}

export interface ReviewsResponse {
  data: Review[];
}

// === Rates ===
export interface TaxAndFee {
  included: boolean;
  description: string;
  amount: number;
  currency: string;
}

export interface CancelPolicyInfo {
  cancelTime: string;
  amount: number;
  currency: string;
  type: string;
  timezone: string;
}

export interface CancellationPolicies {
  cancelPolicyInfos: CancelPolicyInfo[];
  hotelRemarks: string[];
  refundableTag: "RFN" | "NRFN";
}

export interface Rate {
  rateId: string;
  name: string;
  maxOccupancy: number;
  adultCount: number;
  childCount: number;
  boardType: string;
  boardName: string;
  retailRate: {
    total: { amount: number; currency: string }[];
    suggestedSellingPrice?: { amount: number; currency: string }[];
    taxesAndFees?: TaxAndFee[];
  };
  cancellationPolicies: CancellationPolicies;
  paymentTypes: string[];
}

export interface RoomType {
  roomTypeId: string;
  offerId: string;
  supplier: string;
  supplierId: number;
  rates: Rate[];
  offerRetailRate: { amount: number; currency: string };
  suggestedSellingPrice?: { amount: number; currency: string };
}

export interface HotelRates {
  hotelId: string;
  roomTypes: RoomType[];
}

export interface RatesResponse {
  data: HotelRates[];
  sandbox?: boolean;
}

// === Prebook ===
export interface PrebookResponse {
  data: {
    prebookId: string;
    offerId: string;
    hotelId: string;
    checkin: string;
    checkout: string;
    currency: string;
    price: number;
    priceDifferencePercent: number;
    cancellationChanged: boolean;
    boardChanged: boolean;
    transactionId?: string;
    secretKey?: string;
    paymentTypes: string[];
    roomTypes: RoomType[];
  };
}

// === Book ===
export interface BookRequest {
  prebookId: string;
  holder: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  guests: {
    occupancyNumber: number;
    firstName: string;
    lastName: string;
    email: string;
    remarks?: string;
  }[];
  payment: {
    method: string;
    transactionId: string;
  };
  clientReference?: string;
}

export interface BookResponse {
  data: {
    bookingId: string;
    clientReference: string;
    supplierBookingId: string;
    supplierBookingName: string;
    status: string;
    hotelConfirmationCode: string;
    checkin: string;
    checkout: string;
    currency: string;
    price: number;
    holder: { firstName: string; lastName: string; email: string };
    roomTypes: RoomType[];
    cancellationPolicies: CancellationPolicies;
  };
}

// === Search Params (client-side state) ===
export interface SearchParams {
  placeId: string;
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number[];
}

// === Filter State ===
export interface FilterState {
  priceRange: [number, number];
  starRating: number[];
  minGuestRating: number | null;
  boardTypes: string[];
  refundableOnly: boolean;
  facilityIds: number[];
  bedTypes: string[];
  hotelTypeIds: number[];
  chainIds: number[];
  minReviewsCount: number | null;
  accessibleOnly: boolean;
  aiSearch: string;
}
```

- [ ] **Step 2: Create utility functions**

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function nightsBetween(checkin: string, checkout: string): number {
  const start = new Date(checkin);
  const end = new Date(checkout);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getBoardLabel(code: string): string {
  const labels: Record<string, string> = {
    RO: "Room Only",
    BB: "Breakfast included",
    HB: "Half Board",
    FB: "Full Board",
    AI: "All Inclusive",
  };
  return labels[code] || code;
}

export function getRatingLabel(rating: number): string {
  if (rating >= 9) return "Exceptional";
  if (rating >= 8) return "Excellent";
  if (rating >= 7) return "Good";
  if (rating >= 6) return "Pleasant";
  return "Fair";
}

export function getStars(count: number): string {
  return "\u2605".repeat(Math.round(count));
}

export function getHotelImageUrl(
  url: string | undefined,
  fallback = "/placeholder-hotel.svg"
): string {
  if (!url || url.trim() === "") return fallback;
  return url;
}
```

- [ ] **Step 3: Create constants**

```typescript
// lib/constants.ts

export const BOARD_TYPES = [
  { code: "RO", label: "Room Only" },
  { code: "BB", label: "Breakfast included" },
  { code: "HB", label: "Half Board" },
  { code: "FB", label: "Full Board" },
  { code: "AI", label: "All Inclusive" },
] as const;

export const BED_TYPES = ["Double", "Twin", "King", "Queen", "Single"] as const;

export const PROPERTY_TYPES = [
  { id: 1, label: "Hotel" },
  { id: 2, label: "Resort" },
  { id: 3, label: "Apartment" },
  { id: 4, label: "Villa" },
  { id: 5, label: "Hostel" },
  { id: 6, label: "Guesthouse" },
] as const;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Guest Rating" },
  { value: "stars", label: "Star Rating" },
  { value: "reviews", label: "Most Reviews" },
] as const;

export const POPULAR_DESTINATIONS = [
  {
    name: "Paris",
    placeId: "ChIJD7fiBh9u5kcRYJSMaJDnMKg",
    country: "France",
    image: "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&fit=crop",
    hotelCount: "3,240",
    startingPrice: 89,
  },
  {
    name: "Dubai",
    placeId: "ChIJRcbZaklDXz4RYlEphFBu5r0",
    country: "UAE",
    image: "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    hotelCount: "1,820",
    startingPrice: 120,
  },
  {
    name: "London",
    placeId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
    country: "UK",
    image: "https://images.pexels.com/photos/1525612/pexels-photo-1525612.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    hotelCount: "2,890",
    startingPrice: 95,
  },
  {
    name: "Bali",
    placeId: "ChIJjQ0bIJRQ0S0R4KJOA7KVsF4",
    country: "Indonesia",
    image: "https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    hotelCount: "1,460",
    startingPrice: 45,
  },
  {
    name: "Tokyo",
    placeId: "ChIJXSModoWLGGARILWiCfeu2M0",
    country: "Japan",
    image: "https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    hotelCount: "2,100",
    startingPrice: 75,
  },
] as const;

export const AMENITY_LIST = [
  { id: 1, label: "Free Wi-Fi", icon: "WifiHigh" },
  { id: 2, label: "Pool", icon: "SwimmingPool" },
  { id: 3, label: "Spa", icon: "Flower" },
  { id: 4, label: "Parking", icon: "Car" },
  { id: 5, label: "Restaurant", icon: "ForkKnife" },
  { id: 6, label: "Gym", icon: "Barbell" },
  { id: 7, label: "Room Service", icon: "BellSimple" },
  { id: 8, label: "Pet-friendly", icon: "PawPrint" },
  { id: 9, label: "Air Conditioning", icon: "Snowflake" },
  { id: 10, label: "Bar", icon: "Martini" },
  { id: 11, label: "Laundry", icon: "TShirt" },
  { id: 12, label: "Business Centre", icon: "Briefcase" },
] as const;
```

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add TypeScript types, utilities, and constants for LiteAPI integration"
```

---

### Task 3: LiteAPI Server-Side Client

**Files:**
- Create: `lib/liteapi.ts`

- [ ] **Step 1: Create the API client with retry logic**

```typescript
// lib/liteapi.ts

const DATA_BASE_URL = "https://api.liteapi.travel/v3.0";
const BOOK_BASE_URL = "https://book.liteapi.travel/v3.0";

function getApiKey(): string {
  const key = process.env.LITEAPI_KEY;
  if (!key) throw new Error("LITEAPI_KEY environment variable is not set");
  return key;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, options);
    if (response.status === 429 && attempt < retries - 1) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    return response;
  }
  throw new Error(`Failed after ${retries} retries`);
}

function buildHeaders(): HeadersInit {
  return {
    "X-API-Key": getApiKey(),
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function getPlaces(textQuery: string) {
  const params = new URLSearchParams({ textQuery });
  const res = await fetchWithRetry(
    `${DATA_BASE_URL}/data/places?${params}`,
    { headers: buildHeaders() }
  );
  if (!res.ok) throw new Error(`Places API error: ${res.status}`);
  return res.json();
}

export async function getHotels(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const res = await fetchWithRetry(
    `${DATA_BASE_URL}/data/hotels?${searchParams}`,
    { headers: buildHeaders() }
  );
  if (!res.ok) throw new Error(`Hotels API error: ${res.status}`);
  return res.json();
}

export async function getHotelDetail(hotelId: string) {
  const params = new URLSearchParams({ hotelId });
  const res = await fetchWithRetry(
    `${DATA_BASE_URL}/data/hotel?${params}`,
    { headers: buildHeaders() }
  );
  if (!res.ok) throw new Error(`Hotel detail API error: ${res.status}`);
  return res.json();
}

export async function getReviews(hotelId: string, limit = 20) {
  const params = new URLSearchParams({ hotelId, limit: String(limit) });
  const res = await fetchWithRetry(
    `${DATA_BASE_URL}/data/reviews?${params}`,
    { headers: buildHeaders() }
  );
  if (!res.ok) throw new Error(`Reviews API error: ${res.status}`);
  return res.json();
}

export async function getRates(body: {
  hotelIds: string[];
  checkin: string;
  checkout: string;
  occupancies: { adults: number; children?: number[] }[];
  currency: string;
  guestNationality: string;
  [key: string]: unknown;
}) {
  const res = await fetchWithRetry(`${DATA_BASE_URL}/hotels/rates`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ timeout: 10, ...body }),
  });
  if (!res.ok) throw new Error(`Rates API error: ${res.status}`);
  return res.json();
}

export async function prebook(body: {
  offerId: string;
  usePaymentSdk?: boolean;
  voucherCode?: string;
}) {
  const res = await fetchWithRetry(`${BOOK_BASE_URL}/rates/prebook`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Prebook API error: ${res.status}`);
  return res.json();
}

export async function book(body: {
  prebookId: string;
  holder: { firstName: string; lastName: string; email: string; phone?: string };
  guests: { occupancyNumber: number; firstName: string; lastName: string; email: string; remarks?: string }[];
  payment: { method: string; transactionId: string };
  clientReference?: string;
}) {
  const res = await fetchWithRetry(`${BOOK_BASE_URL}/rates/book`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Book API error: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/liteapi.ts
git commit -m "feat: add server-side LiteAPI client with retry logic"
```

---

### Task 4: API Proxy Routes

**Files:**
- Create: `app/api/places/route.ts`, `app/api/hotels/route.ts`, `app/api/hotel/route.ts`, `app/api/reviews/route.ts`, `app/api/rates/route.ts`, `app/api/prebook/route.ts`, `app/api/book/route.ts`

- [ ] **Step 1: Create all 7 API routes**

```typescript
// app/api/places/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPlaces } from "@/lib/liteapi";

export async function GET(req: NextRequest) {
  const textQuery = req.nextUrl.searchParams.get("textQuery");
  if (!textQuery) {
    return NextResponse.json({ error: "textQuery is required" }, { status: 400 });
  }
  try {
    const data = await getPlaces(textQuery);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch places" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/hotels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getHotels } from "@/lib/liteapi";

export async function GET(req: NextRequest) {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  if (!params.placeId && !params.cityName && !params.latitude) {
    return NextResponse.json({ error: "A location parameter is required" }, { status: 400 });
  }
  try {
    const data = await getHotels(params);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch hotels" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/hotel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getHotelDetail } from "@/lib/liteapi";

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get("hotelId");
  if (!hotelId) {
    return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
  }
  try {
    const data = await getHotelDetail(hotelId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch hotel" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getReviews } from "@/lib/liteapi";

export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get("hotelId");
  if (!hotelId) {
    return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
  }
  const limit = Number(req.nextUrl.searchParams.get("limit") || "20");
  try {
    const data = await getReviews(hotelId, limit);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/rates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRates } from "@/lib/liteapi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.checkin || !body.checkout || !body.occupancies) {
      return NextResponse.json({ error: "checkin, checkout, and occupancies are required" }, { status: 400 });
    }
    if (!body.hotelIds && !body.placeId && !body.cityName) {
      return NextResponse.json({ error: "hotelIds, placeId, or cityName is required" }, { status: 400 });
    }
    const data = await getRates(body);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch rates" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/prebook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prebook } from "@/lib/liteapi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.offerId) {
      return NextResponse.json({ error: "offerId is required" }, { status: 400 });
    }
    const data = await prebook({
      offerId: body.offerId,
      usePaymentSdk: body.usePaymentSdk ?? true,
      voucherCode: body.voucherCode,
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prebook" },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { book } from "@/lib/liteapi";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.prebookId || !body.holder || !body.guests || !body.payment) {
      return NextResponse.json({ error: "prebookId, holder, guests, and payment are required" }, { status: 400 });
    }
    const data = await book({
      ...body,
      clientReference: body.clientReference || crypto.randomUUID(),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to book" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify routes compile**

```bash
npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: add 7 API proxy routes for LiteAPI (places, hotels, hotel, reviews, rates, prebook, book)"
```

---

### Task 5: Layout Components (Navbar + Footer)

**Files:**
- Create: `components/layout/navbar.tsx`, `components/layout/footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Build Navbar component**

The Navbar must support two modes: transparent (overlaid on hero, white text) and solid (light bg, dark text). Pass a `variant` prop.

```typescript
// components/layout/navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "transparent" | "solid";
}

export function Navbar({ variant = "solid" }: NavbarProps) {
  const isTransparent = variant === "transparent";

  return (
    <nav
      className={cn(
        "w-full z-50",
        isTransparent
          ? "absolute top-0 left-0"
          : "sticky top-0 bg-surface/85 backdrop-blur-xl border-b border-border"
      )}
    >
      <div className="max-w-[1320px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-sm text-white">
            H
          </div>
          <span
            className={cn(
              "font-bold text-lg tracking-tight",
              isTransparent ? "text-white" : "text-text"
            )}
          >
            HotelSetter
          </span>
        </Link>
        <div
          className={cn(
            "flex gap-8 text-sm font-normal",
            isTransparent ? "text-white/70" : "text-text-muted"
          )}
        >
          <Link href="/" className="hover:text-brand transition-colors duration-300">
            Destinations
          </Link>
          <Link href="/" className="hover:text-brand transition-colors duration-300">
            Deals
          </Link>
          <Link href="/" className="hover:text-brand transition-colors duration-300">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Build Footer component**

```typescript
// components/layout/footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1320px] mx-auto px-8 py-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center font-bold text-xs text-white">
            H
          </div>
          <span className="font-semibold text-[15px]">HotelSetter</span>
        </div>
        <div className="flex gap-7 text-[13px] text-text-muted">
          <Link href="/">Destinations</Link>
          <Link href="/">About</Link>
          <Link href="/">Privacy</Link>
          <Link href="/">Terms</Link>
        </div>
        <div className="text-xs text-text-faint">hotelsetter.com</div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Update root layout to include Footer**

Add Footer to `app/layout.tsx` body:

```typescript
// app/layout.tsx — update body content
import { Footer } from "@/components/layout/footer";

// ... keep existing code, update the body:
<body className="font-sans bg-surface text-text antialiased">
  {children}
  <Footer />
</body>
```

Note: Navbar is NOT in root layout because the homepage uses a transparent variant while other pages use solid. Each page will import Navbar directly.

- [ ] **Step 4: Verify visually**

```bash
npm run dev
```

Open http://localhost:3000 — should see footer at the bottom.

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: add Navbar (transparent/solid variants) and Footer components"
```

---

### Task 6: Search Bar Component

**Files:**
- Create: `components/layout/search-bar.tsx`

- [ ] **Step 1: Build the reusable search bar**

This component handles destination autocomplete, date picking, guest selection, and navigating to the search page. It supports a `variant` prop for full (homepage) and compact (results page navbar) modes.

```typescript
// components/layout/search-bar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "full" | "compact";
  defaultValues?: {
    destination?: string;
    placeId?: string;
    checkin?: string;
    checkout?: string;
    adults?: number;
  };
}

export function SearchBar({ variant = "full", defaultValues }: SearchBarProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultValues?.destination || "");
  const [placeId, setPlaceId] = useState(defaultValues?.placeId || "");
  const [checkin, setCheckin] = useState(defaultValues?.checkin || "");
  const [checkout, setCheckout] = useState(defaultValues?.checkout || "");
  const [adults, setAdults] = useState(defaultValues?.adults || 2);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchPlaces(query: string) {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/places?textQuery=${encodeURIComponent(query)}`);
      const json = await res.json();
      setSuggestions(json.data || []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
  }

  function handleDestinationChange(value: string) {
    setDestination(value);
    setPlaceId("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPlaces(value), 300);
  }

  function selectPlace(place: Place) {
    setDestination(place.displayName);
    setPlaceId(place.placeId);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  function handleSearch() {
    if (!placeId || !checkin || !checkout) return;
    const params = new URLSearchParams({
      placeId,
      destination,
      checkin,
      checkout,
      adults: String(adults),
    });
    router.push(`/search?${params}`);
  }

  if (variant === "compact") {
    return (
      <button
        onClick={() => {/* TODO: expand to full search */}}
        className="flex items-center gap-3 bg-white border border-border rounded-full py-1 pl-5 pr-1 shadow-sm"
      >
        <span className="text-sm font-medium">{destination || "Search"}</span>
        {checkin && checkout && (
          <>
            <span className="text-text-faint">|</span>
            <span className="text-sm text-text-muted">{checkin} – {checkout}</span>
          </>
        )}
        <span className="text-text-faint">|</span>
        <span className="text-sm text-text-muted">{adults} guests</span>
        <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center ml-3">
          <MagnifyingGlass size={16} weight="bold" className="text-white" />
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full max-w-[820px]">
      <div className="bg-white/95 backdrop-blur-2xl border border-black/6 rounded-[20px] p-1.5 flex items-center shadow-[0_24px_64px_-12px_rgba(0,0,0,0.15)]">
        {/* Destination */}
        <div className="flex-[2] px-6 py-4 border-r border-black/6 min-w-0 relative">
          <div className="text-[10px] uppercase tracking-[0.15em] text-text-faint font-semibold">
            Destination
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => handleDestinationChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Where are you going?"
            className="w-full text-[15px] font-medium text-text bg-transparent outline-none placeholder:text-text-faint"
          />
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
              {suggestions.map((place) => (
                <button
                  key={place.placeId}
                  onClick={() => selectPlace(place)}
                  className="w-full px-5 py-3 text-left text-sm hover:bg-surface transition-colors flex flex-col"
                >
                  <span className="font-medium">{place.displayName}</span>
                  <span className="text-text-muted text-xs">{place.formattedAddress}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Check-in */}
        <div className="flex-1 px-6 py-4 border-r border-black/6 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.15em] text-text-faint font-semibold">
            Check-in
          </div>
          <input
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            className="w-full text-[15px] font-medium text-text bg-transparent outline-none"
          />
        </div>
        {/* Check-out */}
        <div className="flex-1 px-6 py-4 border-r border-black/6 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.15em] text-text-faint font-semibold">
            Check-out
          </div>
          <input
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            className="w-full text-[15px] font-medium text-text bg-transparent outline-none"
          />
        </div>
        {/* Guests */}
        <div className="flex-1 px-6 py-4 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.15em] text-text-faint font-semibold">
            Guests
          </div>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full text-[15px] font-medium text-text bg-transparent outline-none appearance-none"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} adult{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        {/* Search button */}
        <button
          onClick={handleSearch}
          className="bg-brand text-white rounded-[14px] px-8 py-4.5 font-semibold text-[15px] m-0.5 shrink-0 hover:bg-brand-dark active:scale-[0.98] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          Search
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/search-bar.tsx
git commit -m "feat: add SearchBar component with autocomplete and date/guest pickers"
```

---

### Task 7: Homepage

**Files:**
- Create: `components/home/hero.tsx`, `components/home/popular-destinations.tsx`, `components/home/why-section.tsx`, `components/home/cta-banner.tsx`
- Modify: `app/page.tsx`

This is a large task. The implementing agent should build each component one at a time using the mockup at `docs/superpowers/specs/2026-04-05-hotel-setter-design.md` as reference and the HTML mockup at `.superpowers/brainstorm/*/content/homepage-light-v3.html` for exact styling.

- [ ] **Step 1: Build Hero component** with dark photo background, gradient fade to light, centred search bar, trust line
- [ ] **Step 2: Build PopularDestinations component** with asymmetric grid (Paris spanning 2 rows), hover zoom, overlay text
- [ ] **Step 3: Build WhySection component** with 4 white feature cards, SVG icons
- [ ] **Step 4: Build CTABanner component** with blue overlay on travel photo
- [ ] **Step 5: Wire up `app/page.tsx`** importing Navbar (transparent variant), Hero, PopularDestinations, WhySection, CTABanner
- [ ] **Step 6: Verify visually** at http://localhost:3000 — dark hero fading to light body, search bar centred, destinations grid, feature cards, CTA
- [ ] **Step 7: Commit**

```bash
git add components/home/ app/page.tsx
git commit -m "feat: build homepage with hero, destinations, features, and CTA sections"
```

---

### Task 8: Search Results Page

**Files:**
- Create: `app/search/page.tsx`, `components/search/search-page-content.tsx`, `components/search/filters-sidebar.tsx`, `components/search/hotel-card.tsx`, `components/search/active-filters.tsx`, `components/search/ai-search-bar.tsx`

This is the most complex page. The implementing agent should reference `.superpowers/brainstorm/*/content/search-results-v2.html` for exact styling.

- [ ] **Step 1: Create `app/search/page.tsx`** as a thin wrapper that reads URL search params and renders the client component
- [ ] **Step 2: Build `search-page-content.tsx`** — the client component that:
  - Reads search params from URL
  - Fetches hotels via `/api/hotels`
  - Fetches rates via `/api/rates`
  - Manages filter state
  - Applies client-side filtering and sorting
  - Renders filters sidebar + results grid
- [ ] **Step 3: Build `filters-sidebar.tsx`** with all filter controls from the design:
  - Price range slider (using shadcn Slider)
  - Star rating checkboxes with counts
  - Guest rating buttons (9+, 8+, 7+, 6+)
  - Board type checkboxes
  - Free cancellation toggle
  - Amenity pills with Phosphor icons
  - Bed type pills
  - Property type checkboxes
  - Hotel chain checkboxes
  - Minimum reviews buttons
  - Accessibility toggle
- [ ] **Step 4: Build `hotel-card.tsx`** — horizontal card with photo, stars, name, location, tags, rating badge, price
- [ ] **Step 5: Build `active-filters.tsx`** — dismissible chip bar
- [ ] **Step 6: Build `ai-search-bar.tsx`** — semantic search input
- [ ] **Step 7: Add loading skeletons** for hotel cards while rates are being fetched
- [ ] **Step 8: Add empty state** — "No hotels found matching your filters" with clear filters CTA
- [ ] **Step 9: Verify end-to-end** — search from homepage navigates to results, filters work, cards display real data
- [ ] **Step 10: Commit**

```bash
git add app/search/ components/search/
git commit -m "feat: build search results page with full filter suite, hotel cards, and AI search"
```

---

### Task 9: Hotel Detail Page

**Files:**
- Create: `app/hotel/[hotelId]/page.tsx`, `components/hotel/photo-gallery.tsx`, `components/hotel/hotel-header.tsx`, `components/hotel/amenities-grid.tsx`, `components/hotel/room-card.tsx`, `components/hotel/reviews-section.tsx`, `components/hotel/booking-sidebar.tsx`, `components/hotel/room-rates-client.tsx`

Reference `.superpowers/brainstorm/*/content/hotel-detail-v1.html` for styling.

- [ ] **Step 1: Create `app/hotel/[hotelId]/page.tsx`** as a server component that:
  - Fetches hotel detail via `getHotelDetail(hotelId)` server-side
  - Fetches reviews via `getReviews(hotelId)` server-side
  - Generates SEO metadata (title, description, og:image)
  - Renders Navbar (solid) + all hotel components
  - Passes search params (dates, guests) from URL query to client components for rates
- [ ] **Step 2: Build `photo-gallery.tsx`** — 5-image grid from `hotelImages[]`, "+N photos" badge, hover zoom. Handle empty/missing images with fallback.
- [ ] **Step 3: Build `hotel-header.tsx`** — stars, name, full address with map pin icon
- [ ] **Step 4: Build `amenities-grid.tsx`** — 2-column grid with matching Phosphor icons for each amenity string in `hotelFacilities[]`
- [ ] **Step 5: Build `room-rates-client.tsx`** — client component that fetches rates via `/api/rates` using the hotelId + search params, manages selected room state, renders RoomCard list
- [ ] **Step 6: Build `room-card.tsx`** — room name, occupancy, board type tag, cancellation tag with deadline date, price, "Select room" button
- [ ] **Step 7: Build `reviews-section.tsx`** — overall score badge, rating label, review count, individual review items with avatar initial, name, date, score, text
- [ ] **Step 8: Build `booking-sidebar.tsx`** — sticky sidebar with price, dates, guests, selected room, "Reserve now" button, price breakdown. "Reserve now" navigates to `/booking` with offerId + hotel info in URL params
- [ ] **Step 9: Verify end-to-end** — click hotel card from search → hotel detail loads with real data, photos, rooms, reviews, sidebar
- [ ] **Step 10: Commit**

```bash
git add app/hotel/ components/hotel/
git commit -m "feat: build hotel detail page with gallery, rooms, reviews, and booking sidebar (SSR)"
```

---

### Task 10: Checkout & Booking Flow

**Files:**
- Create: `app/booking/page.tsx`, `components/booking/checkout-content.tsx`, `components/booking/progress-bar.tsx`, `components/booking/guest-form.tsx`, `components/booking/payment-form.tsx`, `components/booking/order-summary.tsx`, `components/booking/price-change-modal.tsx`

Reference `.superpowers/brainstorm/*/content/checkout-v1.html` for styling.

- [ ] **Step 1: Create `app/booking/page.tsx`** — reads offerId + hotel info from URL params, renders client checkout component
- [ ] **Step 2: Build `checkout-content.tsx`** — orchestrates the multi-step flow:
  1. On mount: calls `/api/prebook` with offerId + `usePaymentSdk: true`
  2. Checks `priceDifferencePercent`, `cancellationChanged`, `boardChanged` — shows modal if changed
  3. Manages step state (guest details → payment → submitting)
  4. On submit: calls `/api/book` with prebookId, holder, guests, payment transactionId
  5. On success: redirects to `/booking/confirmation?bookingId=X`
- [ ] **Step 3: Build `progress-bar.tsx`** — 3-step indicator with done/active/pending states
- [ ] **Step 4: Build `guest-form.tsx`** — first name, last name, email, phone, nationality. Validates all fields. Collapses when completed with Edit link.
- [ ] **Step 5: Build `payment-form.tsx`** — card name, number, expiry, CVC fields. Uses the `secretKey` from prebook to initialise LiteAPI payment SDK. Special requests text field.
- [ ] **Step 6: Build `order-summary.tsx`** — sticky sidebar with hotel photo, room details, dates, price breakdown, cancellation notice
- [ ] **Step 7: Build `price-change-modal.tsx`** — warning dialog showing old price vs new price, cancellation/board changes. "Continue" or "Go back" actions.
- [ ] **Step 8: Verify end-to-end** — select room → checkout loads → prebook succeeds → fill form → book
- [ ] **Step 9: Commit**

```bash
git add app/booking/page.tsx components/booking/
git commit -m "feat: build checkout flow with prebook, guest form, payment, and price change warning"
```

---

### Task 11: Booking Confirmation Page

**Files:**
- Create: `app/booking/confirmation/page.tsx`

- [ ] **Step 1: Build confirmation page**

```typescript
// app/booking/confirmation/page.tsx
import { Navbar } from "@/components/layout/navbar";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface ConfirmationPageProps {
  searchParams: Promise<{
    bookingId?: string;
    hotel?: string;
    room?: string;
    checkin?: string;
    checkout?: string;
    price?: string;
    currency?: string;
  }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;

  return (
    <>
      <Navbar />
      <main className="max-w-[640px] mx-auto px-8 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} weight="fill" className="text-success" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Booking confirmed</h1>
        <p className="text-text-muted mb-8">
          Your reservation has been confirmed. A confirmation email will be sent shortly.
        </p>

        <div className="bg-white border border-border rounded-[20px] p-8 text-left mb-8">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-border">
            <span className="text-sm text-text-muted">Booking reference</span>
            <span className="font-bold text-brand">{params.bookingId || "—"}</span>
          </div>
          {params.hotel && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-muted">Hotel</span>
              <span className="text-sm font-medium">{params.hotel}</span>
            </div>
          )}
          {params.room && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-muted">Room</span>
              <span className="text-sm font-medium">{params.room}</span>
            </div>
          )}
          {params.checkin && params.checkout && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-muted">Dates</span>
              <span className="text-sm font-medium">{params.checkin} — {params.checkout}</span>
            </div>
          )}
          {params.price && (
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
              <span className="font-semibold">Total paid</span>
              <span className="font-bold text-lg">${params.price} {params.currency || "USD"}</span>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="inline-block bg-brand text-white rounded-[14px] px-8 py-4 font-semibold hover:bg-brand-dark active:scale-[0.98] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
        >
          Search more hotels
        </Link>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/booking/confirmation/
git commit -m "feat: add booking confirmation page with reference ID and trip summary"
```

---

### Task 12: Polish, Loading States & Error Handling

**Files:**
- Create: `app/loading.tsx`, `app/search/loading.tsx`, `app/hotel/[hotelId]/loading.tsx`, `app/not-found.tsx`, `public/placeholder-hotel.svg`

- [ ] **Step 1: Create skeleton loading pages** for search and hotel detail using shadcn Skeleton components
- [ ] **Step 2: Create a placeholder hotel SVG** for missing images
- [ ] **Step 3: Create a custom 404 page** with "Page not found" and search CTA
- [ ] **Step 4: Add error boundaries** — `app/error.tsx` and `app/search/error.tsx` with retry buttons
- [ ] **Step 5: Verify all loading/error states work** — slow network simulation, invalid hotel IDs, missing search params
- [ ] **Step 6: Commit**

```bash
git add app/loading.tsx app/search/loading.tsx app/hotel/ app/not-found.tsx app/error.tsx public/
git commit -m "feat: add loading skeletons, error boundaries, 404 page, and image fallbacks"
```

---

### Task 13: Final Integration Test & Deploy Prep

**Files:**
- Modify: `package.json` (if needed), `next.config.ts`

- [ ] **Step 1: Full end-to-end test**

Manually test the complete flow:
1. Homepage loads with hero + search bar
2. Type destination → autocomplete appears
3. Select destination + dates + guests → search
4. Search results load with real hotels + prices
5. Filters work (price, stars, board type, amenities)
6. Click hotel → detail page loads with photos, rooms, reviews
7. Select room → checkout page loads
8. Prebook succeeds → fill guest details → payment
9. Book → confirmation page with booking ID

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "chore: final build verification and integration test pass"
```

- [ ] **Step 5: Deploy to Vercel**

```bash
npx vercel --prod
```

Set the `LITEAPI_KEY` environment variable in Vercel dashboard before deploying.
