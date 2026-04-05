export const BOARD_TYPES = [
  { code: "RO", label: "Room Only" },
  { code: "BB", label: "Breakfast Included" },
  { code: "HB", label: "Half Board" },
  { code: "FB", label: "Full Board" },
  { code: "AI", label: "All Inclusive" },
];

export const BED_TYPES = ["Double", "Twin", "King", "Queen", "Single"];

export const PROPERTY_TYPES = [
  { id: 1, label: "Hotel" },
  { id: 2, label: "Resort" },
  { id: 3, label: "Apartment" },
  { id: 4, label: "Villa" },
  { id: 5, label: "Hostel" },
  { id: 6, label: "Guesthouse" },
];

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Guest Rating" },
  { value: "stars", label: "Star Rating" },
  { value: "reviews", label: "Most Reviewed" },
];

export const POPULAR_DESTINATIONS = [
  {
    name: "Paris",
    placeId: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
    country: "France",
    image: "https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg",
    hotelCount: 1842,
    startingPrice: 89,
  },
  {
    name: "Dubai",
    placeId: "ChIJRcbZaklDXz4RYlEphFBu5r0",
    country: "United Arab Emirates",
    image: "https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg",
    hotelCount: 956,
    startingPrice: 65,
  },
  {
    name: "London",
    placeId: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
    country: "United Kingdom",
    image: "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg",
    hotelCount: 1423,
    startingPrice: 79,
  },
  {
    name: "Bali",
    placeId: "ChIJoQ8Q6NB1mi4RqZWBQbJdGBc",
    country: "Indonesia",
    image: "https://images.pexels.com/photos/1822605/pexels-photo-1822605.jpeg",
    hotelCount: 724,
    startingPrice: 35,
  },
  {
    name: "Tokyo",
    placeId: "ChIJ51cu8IcbXWARiRtXIothAS4",
    country: "Japan",
    image: "https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg",
    hotelCount: 2103,
    startingPrice: 55,
  },
];

export const AMENITY_LIST = [
  { id: 1, label: "Wi-Fi", icon: "WifiHigh" },
  { id: 2, label: "Pool", icon: "Waves" },
  { id: 3, label: "Spa", icon: "Leaf" },
  { id: 4, label: "Parking", icon: "Car" },
  { id: 5, label: "Restaurant", icon: "ForkKnife" },
  { id: 6, label: "Gym", icon: "Barbell" },
  { id: 7, label: "Room Service", icon: "BellRinging" },
  { id: 8, label: "Pet-friendly", icon: "PawPrint" },
  { id: 9, label: "Air Conditioning", icon: "Snowflake" },
  { id: 10, label: "Bar", icon: "Martini" },
  { id: 11, label: "Laundry", icon: "TShirt" },
  { id: 12, label: "Business Centre", icon: "Briefcase" },
];
