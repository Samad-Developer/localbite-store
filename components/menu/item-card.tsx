// components/menu/item-card.tsx
"use client";

import Image from "next/image";
import { Flame, Plus, Minus } from "lucide-react";
import type { MenuItem } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { isSimpleItem } from "@/lib/pricing";
import { useCartLinesForItem, useCartStore } from "@/store/cart-store";

const SPICY_COUNT: Record<MenuItem["spicyLevel"], number> = {
  NONE: 0, MILD: 1, MEDIUM: 2, HOT: 3,
};

interface ItemCardProps {
  item: MenuItem;
  onClick: () => void; // always means "open modal"
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const defaultVariant = item.variants.find((v) => v.isDefault) ?? item.variants[0];
  const spicyCount = SPICY_COUNT[item.spicyLevel];
  const hasDiscount = item.discount !== null;

  const lines = useCartLinesForItem(item.id);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const targetLine = lines[lines.length - 1];

  // Nothing to configure = single variant, zero addon groups.
  const canQuickAdd = isSimpleItem(item);

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!defaultVariant) return;
    addItem({
      menuItemId: item.id,
      menuItemName: item.name,
      menuItemImage: item.images[0]?.url ?? null,
      variantId: defaultVariant.id,
      variantName: defaultVariant.name,
      variantPrice: defaultVariant.price,
      finalPrice: defaultVariant.finalPrice,
      selectedAddons: [],
      quantity: 1,
      specialInstructions: "",
    });
  }

  // The Add button: quick-add if nothing to configure, otherwise open the modal.
  function handleAddButtonClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (canQuickAdd) {
      handleQuickAdd(e);
    } else {
      onClick();
    }
  }

  function handleDecrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (targetLine) updateQuantity(targetLine.cartItemId, targetLine.quantity - 1);
  }

  function handleIncrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (canQuickAdd && targetLine) {
      updateQuantity(targetLine.cartItemId, targetLine.quantity + 1);
    } else if (canQuickAdd) {
      handleQuickAdd(e);
    } else {
      onClick(); // complex item — a new unit needs its own customization
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`flex flex-col overflow-hidden rounded-xl border border-neutral-200 text-left transition-shadow hover:shadow-md cursor-pointer ${
        !item.isAvailable ? "opacity-50" : ""
      }`}
    >
      <div className="relative aspect-square w-full bg-neutral-100">
        {item.images[0] && (
          <Image src={item.images[0].url} alt={item.name} fill className="object-cover pointer-events-none" />
        )}
        <div className="absolute left-2 top-2 flex gap-1 pointer-events-none">
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
                {hasDiscount && (
                  <span className="text-xs text-neutral-400 line-through">{formatPrice(defaultVariant.price)}</span>
                )}
              </>
            )}
          </div>

          {item.isAvailable &&
            (totalQuantity === 0 ? (
              <button
                onClick={handleAddButtonClick}
                className="flex h-7 items-center justify-center rounded-full bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600"
              >
                Add
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-orange-500 px-1 py-1 text-white">
                <button
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-orange-600"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-4 text-center text-xs font-semibold">{totalQuantity}</span>
                <button
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-orange-600"
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