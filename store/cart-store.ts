// store/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { createCartDataSlice, type CartDataSlice } from "./slices/cart-data-slice";
import { createCartUISlice, type CartUISlice } from "./slices/cart-ui-slice";

export type { CartItem, CartAddon } from "./types";

type CartStore = CartDataSlice & CartUISlice;

export const useCartStore = create<CartStore>()(
  persist(
    (...a) => ({
      ...createCartDataSlice(...a),
      ...createCartUISlice(...a),
    }),
    {
      name: "localbite-cart",
      // Only these fields get written to localStorage.
      // isOpen is intentionally excluded — always starts false on reload.
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        deliveryAreaId: state.deliveryAreaId,
      }),
    }
  )
);

// ---------- Derived selectors (never stored, always computed) ----------

export function useCartSubtotal(): number {
  return useCartStore((state) => state.items.reduce((sum, i) => sum + i.itemTotal, 0));
}

export function useCartTotalItems(): number {
  return useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));
}

export function useCartLinesForItem(menuItemId: string) {
  return useCartStore(useShallow((state) => state.items.filter((i) => i.menuItemId === menuItemId)));
}