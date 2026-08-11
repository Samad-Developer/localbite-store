// components/layout/header.tsx
import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { CartWidget } from "@/components/cart/cart-widget";
import type { Restaurant, DeliveryArea } from "@/types/api";

interface HeaderProps {
  restaurant: Restaurant;
  deliveryAreas: DeliveryArea[];
}

export function Header({ restaurant, deliveryAreas }: HeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:grid md:grid-cols-3">
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
              width={64}
              height={64}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-orange-100 md:h-16 md:w-16"
              priority
            />
          )}
        </Link>

        <div className="flex items-center justify-end gap-3">
          <a
            href={`tel:${restaurant.phone}`}
            aria-label="Call restaurant"
            className="text-neutral-600 hover:text-orange-600 md:hidden"
          >
            <Phone className="h-5 w-5" />

          </a>

          <CartWidget restaurant={restaurant} deliveryAreas={deliveryAreas} />
        </div>
      </div>
    </header>
  );
}