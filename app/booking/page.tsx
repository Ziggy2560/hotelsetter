import Navbar from "@/components/layout/navbar";
import { CheckoutContent } from "@/components/booking/checkout-content";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  return (
    <>
      <Navbar variant="solid" />
      <CheckoutContent searchParams={params} />
    </>
  );
}
