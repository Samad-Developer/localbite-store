"use client";

import Image from "next/image";
import { Flame, Minus, Plus, TicketPercent } from "lucide-react";
import type { MenuItem } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { formatVariantDiscount } from "@/lib/pricing";
import { useItemCardActions } from "./use-item-card-actions";

interface BestsellerCardProps {
  item: MenuItem;
  restaurantLogo: string | null;
  onClick: () => void;
}

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
      className={`group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 shadow-md sm:aspect-square ${
        !item.isAvailable ? "opacity-50" : ""
      }`}
    >
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="pointer-events-none object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

      <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-primary shadow-sm ring-1 ring-black/5 backdrop-blur-md">
        <Flame className="h-3 w-3 fill-current" />
        Popular
      </span>

      {discount && (
        <span className="discount-badge pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-secondary shadow-md ring-1 ring-black/5">
          <TicketPercent className="h-4 w-4" strokeWidth={2.25} />
          {formatVariantDiscount(discount)}
        </span>
      )}

      {!item.isAvailable && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium">Unavailable</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3 sm:flex-row sm:items-end sm:justify-between sm:p-4">
        <div className="min-w-0 sm:flex-1">
          <p className="truncate text-sm font-bold leading-tight text-white drop-shadow-sm sm:text-lg">
            {item.name}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1.5 sm:mt-1 sm:gap-2">
            {defaultVariant && (
              <>
                <span className="text-sm font-bold text-white drop-shadow-sm sm:text-base">
                  {formatPrice(defaultVariant.finalPrice)}
                </span>
                {discount && (
                  <span className="text-[11px] text-white/60 line-through sm:text-xs">
                    {formatPrice(defaultVariant.price)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {item.isAvailable &&
          (totalQuantity === 0 ? (
            <button
              onClick={handleAddButtonClick}
              aria-label={`Add ${item.name} to cart`}
              className="flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full bg-brand-primary text-brand-secondary shadow-lg transition-colors hover:bg-brand-hover sm:h-9 sm:w-9 sm:self-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          ) : (
            <div className="flex shrink-0 items-center gap-0.5 self-end rounded-full bg-brand-primary px-1 py-1 text-brand-secondary shadow-lg sm:gap-1 sm:self-auto">
              <button
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-brand-hover sm:h-7 sm:w-7"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-xs font-bold sm:w-5 sm:text-sm">{totalQuantity}</span>
              <button
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-brand-hover sm:h-7 sm:w-7"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
