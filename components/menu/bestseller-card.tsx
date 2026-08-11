// components/menu/bestseller-card.tsx
"use client";

import Image from "next/image";
import { Flame, Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { formatVariantDiscount } from "@/lib/pricing";
import { useItemCardActions } from "./use-item-card-actions";

interface BestsellerCardProps {
  item: MenuItem;
  restaurantLogo: string | null;
  onClick: () => void; // always means "open modal"
}

// Same add-to-cart / open-modal behavior as ItemCard (via useItemCardActions),
// just a different "featured poster" look for the popular-items rail.
export function BestsellerCard({ item, restaurantLogo, onClick }: BestsellerCardProps) {
  const { defaultVariant, discount, totalQuantity, handleAddButtonClick, handleDecrement, handleIncrement } =
    useItemCardActions(item, onClick);

  const itemImageUrl = item.images[0]?.url ?? null;
  const imageSrc = itemImageUrl ?? restaurantLogo;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group relative w-44 shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-md transition-transform hover:-translate-y-0.5 sm:w-52 ${
        !item.isAvailable ? "opacity-50" : ""
      }`}
    >
      <div className="relative aspect-[3/4] w-full bg-neutral-100">
        {imageSrc && (
          <Image src={imageSrc} alt={item.name} fill className="object-cover pointer-events-none" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <span className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
          <Flame className="h-2.5 w-2.5 fill-white" />
          Hot
        </span>

        {discount && (
          <span className="discount-badge pointer-events-none absolute right-2 top-2 rounded-md bg-gradient-to-r from-rose-600 to-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
            {formatVariantDiscount(discount)}
          </span>
        )}

        {!item.isAvailable && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium">Unavailable</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-base font-semibold leading-tight text-white">{item.name}</p>
          <div className="mt-2 flex items-center justify-between">
            {defaultVariant && (
              <span className="text-sm font-bold text-white">{formatPrice(defaultVariant.finalPrice)}</span>
            )}

            {item.isAvailable &&
              (totalQuantity === 0 ? (
                <button
                  onClick={handleAddButtonClick}
                  aria-label="Add to cart"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-white p-1 text-orange-600">
                  <button
                    onClick={handleDecrement}
                    aria-label="Decrease quantity"
                    className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-orange-50"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-4 text-center text-xs font-bold">{totalQuantity}</span>
                  <button
                    onClick={handleIncrement}
                    aria-label="Increase quantity"
                    className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-orange-50"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
