import Image from "next/image";
import type { HotelImage } from "@/lib/types";
import { getHotelImageUrl } from "@/lib/utils";

interface PhotoGalleryProps {
  images: HotelImage[];
  hotelName: string;
}

export default function PhotoGallery({ images, hotelName }: PhotoGalleryProps) {
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const displayed = sorted.slice(0, 5);
  const remaining = images.length - 5;

  // Pad with empty slots if fewer than 5 images
  while (displayed.length < 5) {
    displayed.push({ url: "", urlHd: "", caption: "", order: 0, defaultImage: false });
  }

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-[240px_240px] gap-2 rounded-[24px] overflow-hidden">
      {/* First image — spans 2 rows */}
      <div className="row-span-2 relative overflow-hidden cursor-pointer">
        <Image
          src={getHotelImageUrl(displayed[0]?.urlHd || displayed[0]?.url)}
          alt={displayed[0]?.caption || hotelName}
          fill
          sizes="(max-width: 1320px) 50vw, 660px"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03]"
          unoptimized
        />
      </div>

      {/* Images 2–5 */}
      {displayed.slice(1).map((img, i) => {
        const isLast = i === 3;
        return (
          <div key={i} className="relative overflow-hidden cursor-pointer">
            <Image
              src={getHotelImageUrl(img?.urlHd || img?.url)}
              alt={img?.caption || hotelName}
              fill
              sizes="(max-width: 1320px) 25vw, 330px"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03]"
              unoptimized
            />
            {isLast && remaining > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-[15px] font-semibold">
                  +{remaining} photos
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
