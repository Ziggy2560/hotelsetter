import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Navbar from "@/components/layout/navbar";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const {
    bookingId = "",
    hotel = "",
    room = "",
    checkin = "",
    checkout = "",
    price = "0",
    currency = "USD",
  } = params;

  const priceNum = parseFloat(price) || 0;

  return (
    <>
      <Navbar variant="solid" />
      <main className="bg-surface min-h-screen py-16 px-4">
        <div className="max-w-[640px] mx-auto flex flex-col items-center text-center">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-5">
            <CheckCircle size={32} weight="fill" className="text-success" />
          </div>

          {/* Heading */}
          <h1 className="text-[28px] font-bold text-text mb-3 tracking-tight">
            Booking confirmed
          </h1>
          <p className="text-text-muted text-base mb-8 max-w-[440px]">
            Your booking is confirmed. A confirmation email has been sent to your
            email address with all the details.
          </p>

          {/* Booking details card */}
          <div className="w-full bg-white border border-border rounded-[20px] p-7 text-left flex flex-col gap-4 mb-8">
            {/* Reference */}
            {bookingId && (
              <div className="flex justify-between items-start text-sm pb-4 border-b border-border">
                <span className="text-text-muted">Booking reference</span>
                <span className="font-semibold text-text font-mono text-xs bg-surface px-2.5 py-1 rounded-lg">
                  {bookingId}
                </span>
              </div>
            )}

            {/* Hotel */}
            {hotel && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Hotel</span>
                <span className="font-semibold text-text text-right max-w-[280px]">{hotel}</span>
              </div>
            )}

            {/* Room */}
            {room && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Room</span>
                <span className="font-medium text-text text-right max-w-[280px]">{room}</span>
              </div>
            )}

            {/* Check-in */}
            {checkin && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Check-in</span>
                <span className="font-medium text-text">{formatDate(checkin)}</span>
              </div>
            )}

            {/* Check-out */}
            {checkout && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Check-out</span>
                <span className="font-medium text-text">{formatDate(checkout)}</span>
              </div>
            )}

            {/* Total paid */}
            {priceNum > 0 && (
              <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-border">
                <span className="text-text">Total paid</span>
                <span className="text-text text-base">
                  {formatCurrency(priceNum, currency)}
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-brand text-white rounded-[14px] px-8 py-3.5 font-semibold text-sm hover:bg-brand-dark transition-colors"
          >
            Search more hotels
          </Link>
        </div>
      </main>
    </>
  );
}
