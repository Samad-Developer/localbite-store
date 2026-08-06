// components/menu/banner-carousel.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { CoverImage } from "@/types/api";

interface BannerCarouselProps {
  images: CoverImage[];
  restaurantName: string;
}

type Dimensions = { width: number; height: number };

export function BannerCarousel({ images, restaurantName }: BannerCarouselProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dimensions, setDimensions] = useState<Record<string, Dimensions>>({});
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [height, setHeight] = useState<number>();
  const slideRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const updateHeight = useCallback(() => {
    if (!api) return;
    const activeImage = sorted[api.selectedScrollSnap()];
    const slide = activeImage ? slideRefs.current[activeImage.id] : null;
    if (slide) setHeight(slide.offsetHeight);
  }, [api, sorted]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
      updateHeight();
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    api.on("resize", updateHeight);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
      api.off("resize", updateHeight);
    };
  }, [api, updateHeight]);

  // Recompute once an image's real aspect ratio comes in, and on viewport resize.
  useEffect(() => {
    updateHeight();
  }, [dimensions, updateHeight]);

  useEffect(() => {
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [updateHeight]);

  const handleImageLoad = (id: string, img: HTMLImageElement) => {
    setDimensions((prev) =>
      prev[id] ? prev : { ...prev, [id]: { width: img.naturalWidth, height: img.naturalHeight } }
    );
    setLoaded((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  return (
    <div className="group relative w-full overflow-hidden rounded-xl bg-neutral-100 shadow-sm ring-1 ring-black/5">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]}
      >
        <CarouselContent
          className="ml-0 transition-[height] duration-300 ease-out"
          style={{ height }}
        >
          {sorted.map((image, index) => {
            const dims = dimensions[image.id];
            return (
              <CarouselItem key={image.id} className="pl-0">
                <div
                  ref={(node) => {
                    slideRefs.current[image.id] = node;
                  }}
                  className="relative w-full"
                  style={{ aspectRatio: dims ? `${dims.width} / ${dims.height}` : "16 / 9" }}
                >
                  <Image
                    src={image.url}
                    alt={`${restaurantName} photo ${index + 1}`}
                    fill
                    sizes="100vw"
                    quality={90}
                    preload={index === 0}
                    className={`object-cover transition-opacity duration-500 ${
                      loaded[image.id] ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={(e) => handleImageLoad(image.id, e.currentTarget)}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious className="left-3 hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex" />
        <CarouselNext className="right-3 hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex" />
      </Carousel>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/40 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {sorted.map((image, index) => (
          <button
            key={image.id}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to photo ${index + 1}`}
            className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
