import Navbar from "@/components/layout/navbar";
import { Hero } from "@/components/home/hero";
import { PopularDestinations } from "@/components/home/popular-destinations";
import { WhySection } from "@/components/home/why-section";
import { CTABanner } from "@/components/home/cta-banner";

export default function Home() {
  return (
    <>
      <Navbar variant="transparent" />
      <Hero />
      <PopularDestinations />
      <WhySection />
      <CTABanner />
    </>
  );
}
