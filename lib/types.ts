// ─── Places ──────────────────────────────────────────────────────────────────

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

// ─── Hotels ──────────────────────────────────────────────────────────────────

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

// ─── Hotel Detail ─────────────────────────────────────────────────────────────

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
    special_instructions: string[];
  };
  hotelImages: HotelImage[];
  main_photo: string;
  thumbnail: string;
  country: string;
  city: string;
  starRating: number;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  hotelFacilities: string[];
}

export interface HotelDetailResponse {
  data: HotelDetail;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

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

// ─── Rates ───────────────────────────────────────────────────────────────────

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
  // Room mapping fields (returned when roomMapping: true)
  mappedRoomId?: string;
  roomPhotos?: string[];
  bedType?: string;
  roomAmenities?: string[];
  roomSize?: string;
}

export interface RoomType {
  roomTypeId: string;
  offerId: string;
  supplier: string;
  supplierId: string;
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

// ─── Prebook ─────────────────────────────────────────────────────────────────

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

// ─── Book ─────────────────────────────────────────────────────────────────────

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
    holder: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    roomTypes: RoomType[];
    cancellationPolicies: CancellationPolicies;
  };
}

// ─── Client-Side State ───────────────────────────────────────────────────────

export interface SearchParams {
  placeId: string;
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number[];
}

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
