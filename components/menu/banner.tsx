// components/menu/banner.tsx
import Image from "next/image";
import type { CoverImage } from "@/types/api";

export function Banner({
  images,
  restaurantName,
}: {
  images: CoverImage[];
  restaurantName: string;
}) {
  if (images.length === 0) return null;
  const primary = [...images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return (
    <div className="relative w-full rounded-xl overflow-hidden">
      <Image
        src={primary.url}
        alt={restaurantName}
        width={1400}
        preload={true}
        height={400}
        className="w-full h-auto object-contain rounded-xl overflow-hidden"
        quality={90}
      />
    </div>
  );
}
