import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HotelSetter — Book Hotels That Feel Right",
  description: "Search 2M+ hotels worldwide. Real rates, instant confirmation, no hidden fees.",
  metadataBase: new URL("https://hotelsetter.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans bg-surface text-text antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
