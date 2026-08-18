// components/menu/item-card.tsx
"use client";

import Image from "next/image";
import { Flame, Plus, Minus, Tag } from "lucide-react";
import type { MenuItem } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { formatVariantDiscount } from "@/lib/pricing";
import { useItemCardActions } from "./use-item-card-actions";

interface ItemCardProps {
  item: MenuItem;
  restaurantLogo: string | null;
  onClick: () => void; // always means "open modal"
}

export function ItemCard({ item, restaurantLogo, onClick }: ItemCardProps) {
  const {
    defaultVariant,
    spicyCount,
    discount,
    totalQuantity,
    handleAddButtonClick,
    handleDecrement,
    handleIncrement,
  } = useItemCardActions(item, onClick);

  // Fall back to the restaurant logo when the item has no photo of its own,
  // so cards never show a bare gray box.
  const itemImageUrl = item.images[0]?.url ?? null;
  const imageSrc = itemImageUrl ?? restaurantLogo;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 text-left transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand-primary hover:shadow-lg ${
        !item.isAvailable ? "opacity-50" : ""
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1 pointer-events-none">
          {discount && (
            <span className="discount-badge flex items-center gap-1 rounded-md bg-gradient-to-r from-rose-600 to-red-500 px-2 py-1 text-[10px] font-bold text-white ring-1 ring-white]">
              <Tag className="h-2.5 w-2.5 fill-white" />
              {formatVariantDiscount(discount)}
            </span>
          )}
          {item.isBestseller && (
            <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-medium text-brand-secondary">
              Bestseller
            </span>
          )}
          {/* {item.isNew && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium text-white">
              New
            </span>
          )} */}
        </div>
        <span
          className={`absolute right-2 top-2 h-3 w-3 rounded-full border-2 border-white pointer-events-none ${
            item.foodType === "VEG" ? "bg-green-500" : "bg-red-500"
          }`}
          aria-label={item.foodType === "VEG" ? "Vegetarian" : "Non-vegetarian"}
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium">Unavailable</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-medium leading-tight text-neutral-900">{item.name}</p>
        {/* add item description also */}
        <p className="text-xs text-neutral-500">{item.description}</p>
        {spicyCount > 0 && (
          <div className="flex gap-0.5">
            {Array.from({ length: spicyCount }).map((_, i) => (
              <Flame key={i} className="h-3 w-3 fill-red-500 text-red-500" />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            {defaultVariant && (
              <>
                <span className="text-sm font-semibold text-neutral-900">
                  {formatPrice(defaultVariant.finalPrice)}
                </span>
                {discount && (
                  <span className="text-xs text-neutral-400 line-through">{formatPrice(defaultVariant.price)}</span>
                )}
              </>
            )}
          </div>

          {item.isAvailable &&
            (totalQuantity === 0 ? (
              <button
                onClick={handleAddButtonClick}
                className="flex h-7 items-center justify-center gap-1 rounded-full bg-brand-primary pl-2 pr-3 text-xs font-semibold text-brand-secondary hover:bg-brand-hover"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-brand-primary px-1 py-1 text-brand-secondary">
                <button
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-brand-hover"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-4 text-center text-xs font-semibold">{totalQuantity}</span>
                <button
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-brand-hover"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}