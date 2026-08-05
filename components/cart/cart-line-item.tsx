// components/cart/cart-line-item.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
}

export function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasAddons = item.selectedAddons.length > 0;

  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <div className="flex gap-3">
        {item.menuItemImage && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            <Image src={item.menuItemImage} alt={item.menuItemName} fill className="object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">{item.menuItemName}</p>
              <p className="text-xs text-neutral-500">{item.variantName}</p>
            </div>
            <button
              onClick={() => onRemove(item.cartItemId)}
              aria-label="Remove item"
              className="shrink-0 text-neutral-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {hasAddons && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
            >
              {item.selectedAddons.length} add-on{item.selectedAddons.length > 1 ? "s" : ""}
              <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}

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

          {item.specialInstructions && (
            <p className="mt-1.5 text-xs italic text-neutral-400">&quot;{item.specialInstructions}&quot;</p>
          )}

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-4 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-neutral-900">{formatPrice(item.itemTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}