// store/slices/cart-ui-slice.ts
import type { StateCreator } from "zustand";
import type { CartDataSlice } from "./cart-data-slice";

export interface CartUISlice {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

export const createCartUISlice: StateCreator <
  CartDataSlice & CartUISlice,
  [],
  [],
  CartUISlice
> = (set) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
});