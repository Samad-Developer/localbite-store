// store/slices/cart-data-slice.ts
import type { StateCreator } from "zustand";
import type { OrderType } from "@/types/api";
import type { CartItem, NewCartItem } from "../types";
import type { CartUISlice } from "./cart-ui-slice";

function calculateItemTotal(item: NewCartItem): number {
  const addonsTotal = item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
  return (item.finalPrice + addonsTotal) * item.quantity;
}

function isSameLine(a: NewCartItem, b: CartItem): boolean {
  if (a.menuItemId !== b.menuItemId) return false;
  if (a.variantId !== b.variantId) return false;
  if (a.specialInstructions.trim() !== b.specialInstructions.trim()) return false;
  const aIds = a.selectedAddons.map((x) => x.addonId).sort().join(",");
  const bIds = b.selectedAddons.map((x) => x.addonId).sort().join(",");
  return aIds === bIds;
}

export interface CartDataSlice {
  items: CartItem[];
  orderType: OrderType | null;
  deliveryAreaId: string | null;
  addItem: (item: NewCartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setDeliveryAreaId: (id: string | null) => void;
}

// StateCreator<FullStore, [], [], ThisSlice> — the first type param is the
// COMBINED store (data + UI), so `get()` inside this slice can see UI state
// too if it ever needed to. We only implement CartDataSlice's own fields here.
export const createCartDataSlice: StateCreator <
  CartDataSlice & CartUISlice,
  [],
  [],
  CartDataSlice
> = (set, get) => ({
  items: [],
  orderType: null,
  deliveryAreaId: null,

  addItem: (newItem) => {
    const existing = get().items.find((item) => isSameLine(newItem, item));
    if (existing) {
      get().updateQuantity(existing.cartItemId, existing.quantity + newItem.quantity);
      return;
    }
    const cartItem: CartItem = {
      ...newItem,
      cartItemId: crypto.randomUUID(),
      itemTotal: calculateItemTotal(newItem),
    };
    set((state) => ({ items: [...state.items, cartItem] }));
  },

  removeItem: (cartItemId) => {
    set((state) => ({ items: state.items.filter((i) => i.cartItemId !== cartItemId) }));
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.cartItemId === cartItemId
          ? { ...i, quantity, itemTotal: calculateItemTotal({ ...i, quantity }) }
          : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  setOrderType: (type) =>
    set((state) => ({
      orderType: type,
      deliveryAreaId: type === "DELIVERY" ? state.deliveryAreaId : null,
    })),

  setDeliveryAreaId: (id) => set({ deliveryAreaId: id }),
});