// components/menu/use-item-card-actions.ts
import type { MenuItem } from "@/types/api";
import { isSimpleItem, getVariantDiscount } from "@/lib/pricing";
import { useCartLinesForItem, useCartStore } from "@/store/cart-store";

const SPICY_COUNT: Record<MenuItem["spicyLevel"], number> = {
  NONE: 0, MILD: 1, MEDIUM: 2, HOT: 3,
};

/**
 * Shared cart-interaction logic for any menu-item card style (grid card,
 * bestseller card, ...). Every card variant renders this the same way —
 * only the markup differs.
 */
export function useItemCardActions(item: MenuItem, onClick: () => void) {
  const defaultVariant = item.variants.find((v) => v.isDefault) ?? item.variants[0];
  const spicyCount = SPICY_COUNT[item.spicyLevel];
  const discount = defaultVariant ? getVariantDiscount(defaultVariant) : null;

  const lines = useCartLinesForItem(item.id);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const targetLine = lines[lines.length - 1];

  // Nothing to configure = single variant, zero addon groups.
  const canQuickAdd = isSimpleItem(item);

  function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (!defaultVariant) return;
    addItem({
      menuItemId: item.id,
      menuItemName: item.name,
      menuItemImage: item.images[0]?.url ?? null,
      variantId: defaultVariant.id,
      variantName: defaultVariant.name,
      variantPrice: defaultVariant.price,
      finalPrice: defaultVariant.finalPrice,
      selectedAddons: [],
      quantity: 1,
      specialInstructions: "",
    });
  }

  // The Add button: quick-add if nothing to configure, otherwise open the modal.
  function handleAddButtonClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (canQuickAdd) {
      handleQuickAdd(e);
    } else {
      onClick();
    }
  }

  function handleDecrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (targetLine) updateQuantity(targetLine.cartItemId, targetLine.quantity - 1);
  }

  function handleIncrement(e: React.MouseEvent) {
    e.stopPropagation();
    if (canQuickAdd && targetLine) {
      updateQuantity(targetLine.cartItemId, targetLine.quantity + 1);
    } else if (canQuickAdd) {
      handleQuickAdd(e);
    } else {
      onClick(); // complex item — a new unit needs its own customization
    }
  }

  return {
    defaultVariant,
    spicyCount,
    discount,
    totalQuantity,
    handleAddButtonClick,
    handleDecrement,
    handleIncrement,
  };
}
