import Image from "next/image";
import Link from "next/link";
import { POPULAR_DESTINATIONS } from "@/lib/constants";

export function PopularDestinations() {
  const [paris, ...rest] = POPULAR_DESTINATIONS;

  return (
    <section className="bg-surface py-20">
      <div className="max-w-[1320px] mx-auto px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-[32px] font-bold tracking-tight text-text">Popular destinations</h2>
          <Link
            href="/destinations"
            className="text-[14px] font-medium text-brand hover:opacity-75 transition-opacity duration-300"
          >
            View all destinations
          </Link>
        </div>

        {/* Asymmetric grid */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "280px 280px",
          }}
        >
          {/* Paris — row-span-2 */}
          <DestinationCard destination={paris} className="row-span-2" />

          {/* Remaining 4 */}
          {rest.map((dest) => (
            <DestinationCard key={dest.name} destination={dest} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface Destination {
  name: string;
  placeId: string;
  country: string;
  image: string;
  hotelCount: number;
  startingPrice: number;
}

function DestinationCard({
  destination,
  className = "",
}: {
  destination: Destination;
  className?: string;
}) {
  const { name, country, image, hotelCount, startingPrice, placeId } = destination;

  return (
    <Link
      href={`/search?placeId=${placeId}&destination=${encodeURIComponent(name)}`}
      className={`relative rounded-[20px] overflow-hidden cursor-pointer block group ${className}`}
    >
      {/* Image */}
      <Image
        src={`${image}?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`}
        alt={`${name}, ${country}`}
        fill
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      {/* Bottom gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.7) 100%)",
        }}
      />

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <p className="text-[22px] font-bold text-white leading-tight">{name}</p>
        <p className="text-[13px] text-white/65 mt-0.5">
          {hotelCount.toLocaleString()} hotels from ${startingPrice}/night
        </p>
      </div>
    </Link>
  );
}
