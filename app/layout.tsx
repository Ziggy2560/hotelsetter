import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/layout/footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "HotelSetter — Book Hotels That Feel Right",
    template: "%s — HotelSetter",
  },
  description:
    "Search and book from 2M+ hotels worldwide. Real-time rates, instant confirmation, no hidden fees. Find your perfect stay.",
  metadataBase: new URL("https://hotelsetter.com"),
  keywords: [
    "hotel booking",
    "hotels",
    "accommodation",
    "travel",
    "hotel search",
    "book hotels",
    "hotel deals",
    "hotel comparison",
  ],
  authors: [{ name: "HotelSetter" }],
  creator: "HotelSetter",
  publisher: "HotelSetter",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hotelsetter.com",
    siteName: "HotelSetter",
    title: "HotelSetter — Book Hotels That Feel Right",
    description:
      "Search and book from 2M+ hotels worldwide. Real-time rates, instant confirmation, no hidden fees.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HotelSetter — Book Hotels That Feel Right",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HotelSetter — Book Hotels That Feel Right",
    description:
      "Search and book from 2M+ hotels worldwide. Real-time rates, instant confirmation, no hidden fees.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans bg-surface text-text antialiased">
        {children}
        <Footer />
        <Script
          src="https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1"
          strategy="lazyOnload"
        />
        <Script
          src="https://components.liteapi.travel/v1.0/sdk.umd.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
