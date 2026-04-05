import Navbar from "@/components/layout/navbar";
import { BookingLookup } from "@/components/booking/booking-lookup";

export const metadata = {
  title: "Manage Booking",
  description: "Look up and manage your hotel booking.",
};

export default function BookingsPage() {
  return (
    <>
      <Navbar variant="solid" />
      <main className="bg-surface min-h-screen">
        <BookingLookup />
      </main>
    </>
  );
}
