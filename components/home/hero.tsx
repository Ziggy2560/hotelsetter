import Image from "next/image";
import SearchBar from "@/components/layout/search-bar";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[100dvh] flex items-center justify-center">
      {/* Background photo */}
      <Image
        src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
        alt="Luxury hotel"
        fill
        priority
        className="object-cover object-[center_40%]"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.2) 25%, rgba(10,10,10,0.25) 50%, rgba(10,10,10,0.45) 70%, rgba(250,250,248,1) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1320px] mx-auto px-8 flex flex-col items-center text-center pt-24 pb-32">
        {/* Eyebrow pill */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white text-[13px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
          2M+ properties worldwide
        </div>

        {/* H1 */}
        <h1
          className="font-extrabold tracking-tighter text-white leading-[1.05] mb-4"
          style={{ fontSize: "clamp(40px, 5.5vw, 68px)" }}
        >
          Book hotels that feel{" "}
          <span className="text-brand">right.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[17px] text-white/55 max-w-[520px] mb-8 leading-relaxed">
          Real rates, instant confirmation, and over 2 million properties across 195 countries — all in one search.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-[860px]">
          <SearchBar variant="full" />
        </div>

        {/* Trust line */}
        <p className="mt-5 text-[13px] text-white/50 flex items-center gap-2 flex-wrap justify-center">
          <span>2.1M+ properties</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>195+ countries</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>Instant confirmation</span>
        </p>
      </div>
    </section>
  );
}
