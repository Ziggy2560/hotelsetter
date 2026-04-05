import Image from "next/image";
import Link from "next/link";

export function CTABanner() {
  return (
    <section className="bg-surface pb-20">
      <div className="max-w-[1320px] mx-auto px-8">
        <div className="relative rounded-[24px] overflow-hidden">
          {/* Background photo */}
          <Image
            src="https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
            alt="Travel destination"
            fill
            className="object-cover"
            sizes="(max-width: 1320px) 100vw, 1320px"
          />

          {/* Blue gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,100,220,0.88) 0%, rgba(0,60,160,0.92) 100%)",
            }}
          />

          {/* Centred content */}
          <div className="relative z-10 flex flex-col items-center text-center py-20 px-8">
            <h2 className="text-[36px] font-bold text-white tracking-tight mb-3">
              Ready to explore?
            </h2>
            <p className="text-[17px] text-white/70 max-w-[480px] mb-8 leading-relaxed">
              Find the perfect hotel for your next trip. Millions of options, one simple search.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white text-brand font-semibold text-[15px] px-8 py-3.5 rounded-[14px] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] hover:shadow-xl"
            >
              Search hotels
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
