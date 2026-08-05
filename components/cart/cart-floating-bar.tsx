// components/cart/cart-floating-bar.tsx
"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ChevronUp } from "lucide-react";
import { useCartStore, useCartSubtotal, useCartTotalItems } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartFloatingBar() {
  const isOpen = useCartStore((s) => s.isOpen);
  const openCart = useCartStore((s) => s.openCart);

  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  const totalItems = useCartTotalItems();
  const subtotal = useCartSubtotal();

  // Same hydration-safety reasoning as the header badge: don't trust
  // localStorage-derived values until the client has actually mounted.
  const displayCount = hasHydrated ? totalItems : 0;

  // Nothing to show if the cart's empty, or the full drawer is already open.
  if (displayCount === 0 || isOpen) return null;

  return (
    <button
      onClick={openCart}
      className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-orange-500 px-5 py-3.5 text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:inset-x-auto sm:right-6"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <ShoppingBag className="h-4 w-4" />
        {displayCount} item{displayCount !== 1 ? "s" : ""}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        {formatPrice(subtotal)}
        <ChevronUp className="h-4 w-4" />
      </span>
    </button>
  );
}