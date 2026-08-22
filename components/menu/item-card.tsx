"use client";

import Image from "next/image";
import { Flame, Plus, Minus, TicketPercent } from "lucide-react";
import type { MenuItem } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { formatVariantDiscount } from "@/lib/pricing";
import { useItemCardActions } from "./use-item-card-actions";

interface ItemCardProps {
  item: MenuItem;
  restaurantLogo: string | null;
  onClick: () => void;
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

  const itemImageUrl = item.images[0]?.url ?? null;
  const imageSrc = itemImageUrl ?? restaurantLogo;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group flex cursor-pointer flex-col rounded-2xl border border-neutral-200/80 bg-white p-1.5 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-brand-primary/40 hover:shadow-xl ${
        !item.isAvailable ? "opacity-50" : ""
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="pointer-events-none object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {discount && (
            <span className="discount-badge flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-secondary shadow-md ring-1 ring-black/5">
              <TicketPercent className="h-3.5 w-3.5" strokeWidth={2.25} />
              {formatVariantDiscount(discount)}
            </span>
          )}
          {item.isBestseller && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-primary shadow-sm ring-1 ring-black/5 backdrop-blur-md">
              Bestseller
            </span>
          )}
        </div>

        {!item.isAvailable && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium">Unavailable</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2">
        <div className="flex items-start gap-1.5">
          <p className="line-clamp-1 flex-1 text-[15px] font-bold leading-snug tracking-tight text-neutral-900">
            {item.name}
          </p>
          {spicyCount > 0 && (
            <span className="mt-0.5 flex shrink-0 gap-0.5">
              {Array.from({ length: spicyCount }).map((_, i) => (
                <Flame key={i} className="h-3 w-3 fill-red-500 text-red-500" />
              ))}
            </span>
          )}
        </div>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex min-w-0 items-baseline gap-1.5">
            {defaultVariant && (
              <>
                <span className="text-base font-extrabold tracking-tight text-neutral-900">
                  {formatPrice(defaultVariant.finalPrice)}
                </span>
                {discount && (
                  <span className="text-xs font-medium text-neutral-400 line-through">
                    {formatPrice(defaultVariant.price)}
                  </span>
                )}
              </>
            )}
          </div>

          {item.isAvailable &&
            (totalQuantity === 0 ? (
              <button
                onClick={handleAddButtonClick}
                className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-full bg-brand-primary pl-2.5 pr-3.5 text-xs font-bold text-brand-secondary shadow-sm transition-all duration-200 hover:bg-brand-hover hover:shadow-md active:scale-95"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Add
              </button>
            ) : (
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-brand-primary p-1 text-brand-secondary shadow-sm">
                <button
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-brand-hover active:scale-90"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <span className="w-4 text-center text-xs font-bold">{totalQuantity}</span>
                <button
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-brand-hover active:scale-90"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
