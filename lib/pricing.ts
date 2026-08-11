import type { Variant, AddonGroup } from "@/types/api";
import type { DeliveryArea, OrderType } from "@/types/api";

/**
 * Flattens the selected-addons map into actual Addon objects with prices,
 * by looking them up against the variant's addon groups.
 */
export function getSelectedAddonDetails(
  variant: Variant,
  selectedAddons: Record<string, string[]>
) {
  const result: { addonId: string; addonGroupId: string; name: string; price: number }[] = [];

  for (const group of variant.addonGroups) {
    const selectedIds = selectedAddons[group.id] ?? [];
    for (const addon of group.addons) {
      if (selectedIds.includes(addon.id)) {
        result.push({
          addonId: addon.id,
          addonGroupId: group.id,
          name: addon.name,
          price: addon.price,
        });
      }
    }
  }
  return result;
}

/**
 * Total price for ONE unit (variant + its selected addons) — quantity
 * is applied separately by the caller, since "per-unit price" and
 * "total for N units" are genuinely different questions.
 */
export function calculateUnitPrice(variant: Variant, selectedAddons: Record<string, string[]>): number {
  const addonsTotal = getSelectedAddonDetails(variant, selectedAddons).reduce(
    (sum, a) => sum + a.price,
    0
  );
  return variant.finalPrice + addonsTotal;
}

/**
 * Which required addon groups are NOT yet satisfied.
 * Returns an array of group IDs so the UI can highlight exactly
 * which sections are blocking submission — not just a yes/no.
 */
export function getUnsatisfiedRequiredGroups(
  addonGroups: AddonGroup[],
  selectedAddons: Record<string, string[]>
): string[] {
  return addonGroups
    .filter((group) => group.isRequired)
    .filter((group) => {
      const count = (selectedAddons[group.id] ?? []).length;
      return count < group.minSelections;
    })
    .map((group) => group.id);
}

export function canAddToCart(addonGroups: AddonGroup[], selectedAddons: Record<string, string[]>): boolean {
  return getUnsatisfiedRequiredGroups(addonGroups, selectedAddons).length === 0;
}

/**
 * Enforces isMultiple / maxSelections rules when the user clicks an addon.
 * Returns the NEW selection array for that one group — pure, no side effects.
 */
export function toggleAddonSelection(
  group: AddonGroup,
  currentSelection: string[],
  addonId: string
): string[] {
  const isSelected = currentSelection.includes(addonId);

  // Radio behavior — single-select group
  if (!group.isMultiple) {
    return isSelected ? [] : [addonId];
  }

  // Checkbox behavior — multi-select group
  if (isSelected) {
    return currentSelection.filter((id) => id !== addonId);
  }

  if (group.maxSelections !== null && currentSelection.length >= group.maxSelections) {
    return currentSelection; // at max, ignore the click — no-op
  }

  return [...currentSelection, addonId];
}

export function isSimpleItem(item: { variants: { addonGroups: unknown[] }[] }): boolean {
  if (item.variants.length > 1) return false;
  const onlyVariant = item.variants[0];
  return !onlyVariant || onlyVariant.addonGroups.length === 0;
}

export function getDeliveryFee(
  orderType: OrderType | null,
  deliveryAreaId: string | null,
  deliveryAreas: DeliveryArea[],
  fallbackFee: number
): number {
  if (orderType !== "DELIVERY") return 0;
  const area = deliveryAreas.find((a) => a.id === deliveryAreaId);
  return area ? area.deliveryFee : fallbackFee;
}

export function getMinimumOrder(
  orderType: OrderType | null,
  deliveryAreaId: string | null,
  deliveryAreas: DeliveryArea[],
  fallbackMinimum: number
): number {
  if (orderType !== "DELIVERY") return 0;
  const area = deliveryAreas.find((a) => a.id === deliveryAreaId);
  return area ? area.minimumOrder : fallbackMinimum;
}

// lib/pricing.ts — add this function
import type { Restaurant, PaymentMethod } from "@/types/api";
import type { CartItem } from "@/store/types";

export function getAvailablePaymentMethods(restaurant: Restaurant): PaymentMethod[] {
  return [
    ...(restaurant.acceptsCash ? (["CASH"] as const) : []),
    ...(restaurant.acceptsCard ? (["CARD"] as const) : []),
    ...(restaurant.acceptsOnline ? (["ONLINE"] as const) : []),
  ];
}

export interface VariantDiscount {
  amountOff: number;
  percentOff: number;
}

/**
 * A variant counts as discounted whenever its own finalPrice is below its
 * own price — checked per variant so every variant carries its own
 * discount instead of only whichever one happens to be isDefault.
 */
export function getVariantDiscount(variant: Variant): VariantDiscount | null {
  if (variant.finalPrice >= variant.price) return null;
  const amountOff = variant.price - variant.finalPrice;
  return { amountOff, percentOff: Math.round((amountOff / variant.price) * 100) };
}

export function formatVariantDiscount(discount: VariantDiscount): string {
  return `${discount.percentOff}% OFF`;
}

function getCartItemOriginalUnitPrice(item: CartItem): number {
  const addonsTotal = item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
  return item.variantPrice + addonsTotal;
}

export function getCartItemOriginalTotal(item: CartItem): number {
  return getCartItemOriginalUnitPrice(item) * item.quantity;
}

export function getCartItemDiscount(item: CartItem): number {
  return Math.max(0, getCartItemOriginalTotal(item) - item.itemTotal);
}

export function getCartTotalDiscount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getCartItemDiscount(item), 0);
}