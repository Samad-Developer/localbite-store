"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore, useCartSubtotal, useCartTotalItems } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartFloatingBar() {
  const isOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);

  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  const totalItems = useCartTotalItems();
  const subtotal = useCartSubtotal();

  const displayCount = hasHydrated ? totalItems : 0;

  if (displayCount === 0 || isOpen) return null;

  return (
    <button
      onClick={openCart}
      className="fixed inset-x-4 bottom-4 z-40 mx-auto grid max-w-xs grid-cols-3 items-center gap-2 rounded-2xl bg-brand-primary px-4 py-3.5 text-brand-secondary shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <span className="relative flex h-9 w-9 items-center justify-center justify-self-start rounded-full bg-brand-secondary/15">
        <ShoppingCart className="h-4 w-4" />
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-secondary px-1 text-[10px] font-bold text-brand-strong">
          {displayCount}
        </span>
      </span>
      <span className="justify-self-center text-sm font-bold tracking-wide">View Cart</span>
      <span className="justify-self-end text-sm font-bold">{formatPrice(subtotal)}</span>
    </button>
  );
}
