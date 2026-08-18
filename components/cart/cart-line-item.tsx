// components/cart/cart-line-item.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { getCartItemOriginalTotal, getCartItemDiscount } from "@/lib/pricing";

interface CartLineItemProps {
  item: CartItem;
  restaurantLogo: string | null;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
}

export function CartLineItem({ item, restaurantLogo, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasAddons = item.selectedAddons.length > 0;
  const discountAmount = getCartItemDiscount(item);
  const originalTotal = getCartItemOriginalTotal(item);
  const imageSrc = item.menuItemImage ?? restaurantLogo;

  return (
    <div className="group py-3">
      <div className="flex gap-3">
        {imageSrc && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-100">
            <Image src={imageSrc} alt={item.menuItemName} fill className="object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{item.menuItemName}</p>
              <p className="text-xs text-neutral-500">{item.variantName}</p>
            </div>
            <button
              onClick={() => onRemove(item.cartItemId)}
              aria-label="Remove item"
              className="shrink-0 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {item.specialInstructions && (
            <p className="mt-1.5 text-xs italic text-neutral-400">&quot;{item.specialInstructions}&quot;</p>
          )}

          <div className="mt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1">
              <button
                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm hover:bg-neutral-50"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="text-right">
              {discountAmount > 0 && (
                <p className="text-xs text-neutral-400 line-through">{formatPrice(originalTotal)}</p>
              )}
              <p className="text-sm font-bold text-neutral-900">{formatPrice(item.itemTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {hasAddons && (
        <div className="mt-2 border-t border-neutral-100 pt-2">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-xs text-brand-strong hover:text-brand-strong"
          >
            {item.selectedAddons.length} add-on{item.selectedAddons.length > 1 ? "s" : ""}
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {expanded && (
            <ul className="mt-1.5 space-y-0.5 border-l-2 border-neutral-100 pl-2">
              {item.selectedAddons.map((addon) => (
                <li key={addon.addonId} className="flex justify-between text-xs text-neutral-500">
                  <span>{addon.name}</span>
                  {addon.price > 0 && <span>+{formatPrice(addon.price)}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}