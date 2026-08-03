// components/cart/cart-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartSubtotal, useCartTotalItems } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();
  const totalItems = useCartTotalItems();
  const displayCount = hasHydrated ? totalItems : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <button
          aria-label={`Cart, ${displayCount} items`}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
        >
          <ShoppingBag className="h-5 w-5" />
          {displayCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-medium text-white">
              {displayCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-neutral-500">
            <ShoppingBag className="h-10 w-10 text-neutral-300" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-2">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 border-b border-neutral-100 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{item.menuItemName}</p>
                    <p className="text-xs text-neutral-500">{item.variantName}</p>
                    {item.selectedAddons.length > 0 && (
                      <p className="text-xs text-neutral-400">
                        {item.selectedAddons.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      aria-label="Remove item"
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-medium text-neutral-900">{formatPrice(item.itemTotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="mb-3 flex items-center justify-between text-sm font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  setOpen(false);
                  router.push("/checkout");
                }}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}