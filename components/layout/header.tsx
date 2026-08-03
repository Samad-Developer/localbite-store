// components/layout/header.tsx
import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { CartWidget } from "@/components/cart/cart-widget";
import type { Restaurant } from "@/types/api";

export function Header({ restaurant }: { restaurant: Restaurant }) {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:grid md:grid-cols-3">
        <div className="hidden md:flex">
          <a
            href={`tel:${restaurant.phone}`}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-orange-600"
          >
            <Phone className="h-4 w-4" />
            {restaurant.phone}
          </a>
        </div>

        <Link href="/" className="flex items-center gap-2 md:justify-center">
          {restaurant.logoUrl && (
            <Image
              src={restaurant.logoUrl}
              alt={restaurant.name}
              width={36}
              height={36}
              className="rounded-full object-cover"
              priority
            />
          )}
          <span className="text-lg font-semibold text-neutral-900">{restaurant.name}</span>
        </Link>

        <div className="flex items-center justify-end gap-3">
          <a
           href={`tel:${restaurant.phone}`}
            aria-label="Call restaurant"
            className="text-neutral-600 hover:text-orange-600 md:hidden"
            >
            <Phone className="h-5 w-5" />

          </a>
           
          <CartWidget />
        </div>
      </div>
    </header>
  );
}