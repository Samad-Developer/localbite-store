// components/menu/item-card.tsx
"use client";

import Image from "next/image";
import { Flame } from "lucide-react";
import type { MenuItem } from "@/types/api";
import { formatPrice } from "@/lib/utils";

const SPICY_COUNT: Record<MenuItem["spicyLevel"], number> = {
  NONE: 0,
  MILD: 1,
  MEDIUM: 2,
  HOT: 3,
};

export function ItemCard({
  item,
  onClick,
}: {
  item: MenuItem;
  onClick: () => void;
}) {
  const defaultVariant = item.variants.find((v) => v.isDefault) ?? item.variants[0];
  const spicyCount = SPICY_COUNT[item.spicyLevel];
  const hasDiscount = item.discount !== null;

  return (
    <button
      onClick={onClick}
      disabled={!item.isAvailable}
      className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 text-left transition-shadow hover:shadow-md disabled:opacity-50"
    >
      <div className="relative aspect-square w-full bg-neutral-100 p-2">
        {item.images[0] && (
          <Image
            src={item.images[0].url}
            alt={item.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {item.isBestseller && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-medium text-white">
              Bestseller
            </span>
          )}
          {item.isNew && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium text-white">
              New
            </span>
          )}
        </div>
        <span
          className={`absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-white ${
            item.foodType === "VEG" ? "bg-green-500" : "bg-red-500"
          }`}
          aria-label={item.foodType === "VEG" ? "Vegetarian" : "Non-vegetarian"}
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-medium leading-tight text-neutral-900">
          {item.name}
        </p>
        {spicyCount > 0 && (
          <div className="flex gap-0.5">
            {Array.from({ length: spicyCount }).map((_, i) => (
              <Flame key={i} className="h-3 w-3 fill-red-500 text-red-500" />
            ))}
          </div>
        )}
        {defaultVariant && (
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-sm font-semibold text-neutral-900">
              {formatPrice(defaultVariant.finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(defaultVariant.price)}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
