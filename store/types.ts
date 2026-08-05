// store/types.ts
export interface CartAddon {
  addonId: string;
  addonGroupId: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImage: string | null;
  variantId: string;
  variantName: string;
  variantPrice: number;
  finalPrice: number;
  selectedAddons: CartAddon[];
  quantity: number;
  specialInstructions: string;
  itemTotal: number;
}

export type NewCartItem = Omit<CartItem, "cartItemId" | "itemTotal">;