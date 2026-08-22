import type { CoverImage } from "@/types/api";
import { BannerCarousel } from "./banner-carousel";

export function Banner({ images, restaurantName }: { images: CoverImage[]; restaurantName: string }) {
  if (images.length === 0) return null;

  if (images.length > 1) {
    return <BannerCarousel images={images} restaurantName={restaurantName} />;
  }

  const primary = images[0];
  return (
    <div className="w-full overflow-hidden rounded-xl">

            <img src={primary.url} alt={restaurantName} className="block h-auto w-full" />

    </div>
  );
}
