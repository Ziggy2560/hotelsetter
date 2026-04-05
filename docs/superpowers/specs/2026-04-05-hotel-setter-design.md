# Hotel Setter — Design Specification

## Overview

Hotel Setter is a hotel booking platform at hotelsetter.com enabling travellers to search, compare, and book accommodation across 2M+ properties worldwide. Powered by LiteAPI.travel v3.0 with real-time rates, availability, and instant booking confirmation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui (customized) |
| Fonts | Outfit (Google Fonts) |
| API Provider | LiteAPI v3.0 |
| Auth (API) | `X-API-Key` header, server-side only |
| Deployment | Vercel |
| Domain | hotelsetter.com |

## Brand

- **Primary colour:** `#007AFF` (Electric Blue)
- **Background:** `#FAFAF8` (warm off-white)
- **Text:** `#1a1a1a` (off-black)
- **Accent green:** `#16a34a` (cancellation/success)
- **Star colour:** `#f59e0b` (amber)
- **Font:** Outfit (300-800 weights)
- **Logo:** Blue pin with "H" monogram, existing assets in `/Projects/hotelsetter/`

## Architecture

```
Browser → Next.js App (Vercel)
            ├── Server Components (hotel detail pages — SSR for SEO)
            ├── Client Components (search, filters, checkout — interactive)
            └── API Routes (app/api/*) → LiteAPI
                  ├── api.liteapi.travel/v3.0 (data/search endpoints)
                  └── book.liteapi.travel/v3.0 (prebook/book endpoints)
                  └── API key injected from LITEAPI_KEY env var
```

### Security
- `LITEAPI_KEY` in `.env.local` (git-ignored), never exposed to client
- All LiteAPI calls proxied through `/api/*` routes
- Input validation on all API routes before forwarding
- Rate limiting via Vercel edge middleware

## Route Structure

```
app/
├── page.tsx                          — Homepage
├── search/page.tsx                   — Search results (client component)
├── hotel/[hotelId]/page.tsx          — Hotel detail (server component, SSR)
├── booking/page.tsx                  — Checkout (client component)
├── booking/confirmation/page.tsx     — Booking confirmation
├── layout.tsx                        — Root layout (navbar, footer, fonts)
├── api/
│   ├── places/route.ts              — GET → api.liteapi.travel/v3.0/data/places
│   ├── hotels/route.ts              — GET → api.liteapi.travel/v3.0/data/hotels
│   ├── hotel/route.ts               — GET → api.liteapi.travel/v3.0/data/hotel
│   ├── reviews/route.ts             — GET → api.liteapi.travel/v3.0/data/reviews
│   ├── rates/route.ts               — POST → api.liteapi.travel/v3.0/hotels/rates
│   ├── prebook/route.ts             — POST → book.liteapi.travel/v3.0/rates/prebook
│   └── book/route.ts                — POST → book.liteapi.travel/v3.0/rates/book
```

## Pages

### 1. Homepage (`/`)

**Design:** Dark cinematic hero with full-bleed hotel photo, fading into warm light body (`#FAFAF8`).

**Components:**
- **Navbar** — Logo + nav links, overlaid on hero (white text)
- **Hero** — Full viewport height, centred content:
  - Eyebrow pill: "2M+ properties worldwide"
  - H1: "Book hotels that feel right."
  - Subtitle: value proposition
  - **Search bar** (centred, white/solid with glassmorphic shadow):
    - Destination (autocomplete via `/api/places`)
    - Check-in / Check-out date pickers
    - Guest count selector (adults, children with ages)
    - Search button
  - Trust line: "2.1M+ properties · 195+ countries · Instant confirmation"
- **Popular Destinations** — Asymmetric grid (2fr 1fr 1fr, Paris spans 2 rows), real photos, hover zoom, hotel count + starting price overlay
- **Why HotelSetter** — 4 white cards on light bg (properties, real-time rates, instant confirmation, secure checkout) with SVG icons
- **CTA Banner** — Blue overlay on travel photo, "Ready to explore?" with search CTA
- **Footer** — Logo, nav links, copyright

**Data flow:**
1. User types destination → `GET /api/places?textQuery=X` → autocomplete dropdown
2. User submits search → navigate to `/search?dest=X&checkin=Y&checkout=Z&guests=N`

### 2. Search Results (`/search`)

**Design:** Light background, sticky navbar with compact search pill, two-column layout.

**Components:**
- **Sticky Navbar** — Compact search pill showing current search (destination, dates, guests), click to re-expand
- **AI Search Bar** — Semantic search input ("boutique hotel with rooftop pool near Eiffel Tower") using LiteAPI `aiSearch` param
- **Filters Sidebar** (sticky, scrollable):
  - Price range slider
  - Star rating (checkboxes with counts)
  - Guest rating (9+, 8+, 7+, 6+ button group)
  - Board type (RO, BB, HB, FB, AI checkboxes with counts)
  - Free cancellation toggle
  - Amenities (pill tags with icons: Wi-Fi, Pool, Spa, Parking, Restaurant, Gym, Room Service, Pet-friendly + "Show more")
  - Bed type (pill tags: Double, Twin, King, Queen, Single)
  - Property type (Hotel, Resort, Apartment, Villa, Hostel, Guesthouse with counts)
  - Hotel chain (Hilton, Marriott, IHG, Accor, Hyatt + "Show more")
  - Minimum reviews (50+, 100+, 500+, 1000+ buttons)
  - Accessibility toggle
- **Active Filters Bar** — Dismissible chips showing applied filters
- **Sort Dropdown** — Recommended, Price Low/High, Guest Rating, Star Rating, Most Reviews
- **Hotel Cards** (horizontal, stacked):
  - Hotel photo (280px width, hover zoom)
  - Star rating, hotel name, location with distance
  - Board type + cancellation + chain tags
  - Guest rating badge with label + review count
  - Price per night + total price

**Data flow:**
1. Page loads → `GET /api/hotels?placeId=X` (or cityName+countryCode) → hotel list
2. Simultaneously → `POST /api/rates` with hotelIds, dates, occupancies → prices
3. Filters applied client-side on the returned data, some re-query the API (amenities, star rating)

### 3. Hotel Detail (`/hotel/[hotelId]`)

**Design:** Light background, server-rendered for SEO. Two-column: content left, booking sidebar right.

**Components:**
- **Photo Gallery** — 5-image grid (large hero spanning 2 rows + 4 smaller), "+N photos" badge, hover zoom. Images from `hotelImages[]` array with `url`/`urlHd`
- **Hotel Header** — Stars, name, full address with pin icon
- **Meta Bar** — Check-in time, check-out time, guest rating
- **Description** — `hotelDescription` content (may contain HTML)
- **Amenities Grid** — 2-column grid with icons, from `hotelFacilities[]` array
- **Available Rooms** — Cards per room type:
  - Room name, guest count, size, view type
  - Board type + cancellation policy tags (from `refundableTag` RFN/NRFN)
  - Cancellation deadline from `cancelPolicyInfos[].cancelTime`
  - Price per night + total, "Select room" button
- **Guest Reviews** — Score badge, rating label, review count, individual reviews with avatar, name, date, score, text
- **Booking Sidebar** (sticky):
  - Price per night
  - Check-in / check-out dates
  - Guest count
  - Selected room name
  - "Reserve now" button
  - Price breakdown (nightly rate x nights, taxes & fees, total)

**Data flow:**
1. Server-side: `GET /api/hotel?hotelId=X` → hotel details + photos + amenities
2. Server-side: `GET /api/reviews?hotelId=X` → reviews
3. Client-side: `POST /api/rates` with hotelId, dates, occupancies → room rates + pricing

### 4. Checkout (`/booking`)

**Design:** Light background, clean form layout. Two-column: form left, order summary right.

**Components:**
- **Navbar** — Simplified, secure checkout badge (lock icon + "Secure checkout")
- **Progress Bar** — 3 steps: Guest Details → Payment → Confirmation
- **Guest Details Form** (Step 1):
  - First name, last name, email, phone
  - Nationality (for `guestNationality` param)
  - Collapsible when completed with Edit link
- **Payment Form** (Step 2):
  - Name on card, card number, expiry, CVC
  - Uses LiteAPI Payment SDK (`secretKey` from prebook response)
  - No raw card data touches our server
- **Special Requests** (optional text field)
- **Submit Button** — "Confirm & pay $X" with terms disclaimer
- **Order Summary Sidebar** (sticky):
  - Hotel photo + name + stars
  - Room type, dates, duration, guests, board type
  - Price breakdown (nightly x nights, taxes, total)
  - Cancellation notice (green, if refundable)

**Data flow:**
1. User arrives with selected room → `POST /api/prebook` with `offerId` from rates + `usePaymentSdk: true`
2. Prebook response returns `prebookId`, `secretKey`, `transactionId`, `price`
3. **Check `priceDifferencePercent`, `cancellationChanged`, `boardChanged`** — warn user if any changed
4. User fills guest details + payment (card collected via LiteAPI SDK using `secretKey`)
5. Submit → `POST /api/book` with `prebookId`, holder info, guests, payment `transactionId`
6. Success → redirect to confirmation page with `bookingId`

### 5. Booking Confirmation (`/booking/confirmation`)

**Design:** Clean confirmation page with success state.

**Components:**
- Success icon + "Booking confirmed" heading
- Booking reference ID (`bookingId`)
- Hotel confirmation code (if available, may be delayed)
- Trip summary (hotel, room, dates, guests)
- Price paid
- Cancellation policy reminder
- "Search more hotels" CTA

## API Integration Details

### Authentication
All requests include header: `X-API-Key: {LITEAPI_KEY}`

### Base URLs
- Static data + search: `https://api.liteapi.travel/v3.0`
- Booking operations: `https://book.liteapi.travel/v3.0`

### Key API Behaviours
- **Rate limits:** 250 req/s production, 429 on exceed. Implement exponential backoff.
- **Hotel images can be empty strings** — always handle missing images with fallback
- **Cancellation `cancelTime` is always GMT** regardless of hotel location
- **Board type codes:** RO (Room Only), BB (Bed & Breakfast), HB (Half Board), FB (Full Board), AI (All Inclusive)
- **`refundableTag`:** "RFN" = refundable, "NRFN" = non-refundable
- **`clientReference`** in booking = idempotency key to prevent duplicate bookings
- **Timeout recommendation:** 6-12 seconds for rates search
- **Prebook checks:** Always verify `priceDifferencePercent`, `cancellationChanged`, `boardChanged` before proceeding to book

### Payment Flow
1. Prebook with `usePaymentSdk: true` → get `secretKey` + `transactionId`
2. Use `secretKey` client-side to collect card details securely (Stripe-like SDK)
3. Book with `payment: { method: "TRANSACTION_ID", transactionId: "..." }`
4. No raw card data touches our server

## Environment Variables

```
LITEAPI_KEY=prod_1d36d274-1c0a-41da-ba76-f62d3f43ad6c
```

## Error Handling

- Loading states: Skeleton loaders matching component dimensions
- Empty states: "No hotels found matching your filters" with clear filters CTA
- API errors: Inline error messages, retry logic with exponential backoff
- Payment errors: Clear inline form validation, error messages below fields
- Rate changes: Modal warning if price/cancellation/board changed between search and prebook

## File Structure

```
hotelsetter/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── search/page.tsx
│   ├── hotel/[hotelId]/page.tsx
│   ├── booking/page.tsx
│   ├── booking/confirmation/page.tsx
│   └── api/ (7 route files)
├── components/
│   ├── layout/ (Navbar, Footer, SearchBar)
│   ├── home/ (Hero, PopularDestinations, WhySection, CTABanner)
│   ├── search/ (FiltersSidebar, HotelCard, ActiveFilters, SortDropdown, AISearchBar)
│   ├── hotel/ (PhotoGallery, HotelHeader, Amenities, RoomCard, Reviews, BookingSidebar)
│   ├── booking/ (ProgressBar, GuestForm, PaymentForm, OrderSummary)
│   └── ui/ (shadcn components — customized)
├── lib/
│   ├── liteapi.ts (server-side API client)
│   ├── types.ts (TypeScript types for API responses)
│   └── utils.ts (formatters, helpers)
├── public/
│   ├── hotelsetter-primary.png
│   ├── hotelsetter-favicon.svg
│   └── ... (existing brand assets)
├── .env.local (LITEAPI_KEY — git-ignored)
├── tailwind.config.ts
├── next.config.ts
└── package.json
```
