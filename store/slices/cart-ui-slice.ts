import type { StateCreator } from "zustand";
import type { CartChange } from "@/lib/cart-reprice";
import type { CartDataSlice } from "./cart-data-slice";

export interface CartUISlice {
  isOpen: boolean;
  /** Result of the last reprice. Deliberately not persisted — it describes one moment. */
  repriceChanges: CartChange[];
  openCart: () => void;
  closeCart: () => void;
  setRepriceChanges: (changes: CartChange[]) => void;
}

export const createCartUISlice: StateCreator <
  CartDataSlice & CartUISlice,
  [],
  [],
  CartUISlice
> = (set) => ({
  isOpen: false,
  repriceChanges: [],
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setRepriceChanges: (changes) => set({ repriceChanges: changes }),
});
