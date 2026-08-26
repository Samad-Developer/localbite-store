import type { Addon, MenuItem, MenuResponse, Variant } from "@/types/api";
import type { CartAddon, CartItem } from "@/store/types";
import { calculateItemTotal, getUnsatisfiedRequiredGroups } from "./pricing";

/** Prices are Prisma `Float` columns, so never compare them with `!==`. */
const PRICE_EPSILON = 0.01;

function differs(a: number, b: number, tolerance = PRICE_EPSILON): boolean {
  return Math.abs(a - b) > tolerance;
}

export type DropReason = "UNAVAILABLE" | "NEEDS_RECONFIG";

export type CartChange =
  | { type: "price"; cartItemId: string; name: string; from: number; to: number }
  | { type: "removed"; cartItemId: string; name: string; reason: DropReason }
  | { type: "addon-removed"; cartItemId: string; name: string; addonName: string };

export interface RepriceResult {
  items: CartItem[];
  changes: CartChange[];
  changed: boolean;
}

interface IndexedVariant {
  menuItem: MenuItem;
  variant: Variant;
  /** Scoped to this variant — addon ids are not globally unique across variants. */
  addons: Map<string, Addon>;
}

function lineKey(menuItemId: string, variantId: string): string {
  return `${menuItemId}:${variantId}`;
}

/**
 * The menu API only returns items, variants, and addons that are currently
 * available, so absence from this index is exactly the "no longer orderable"
 * signal — it covers deletion, isAvailable=false, and a hidden category alike.
 */
function buildMenuIndex(menu: MenuResponse): Map<string, IndexedVariant> {
  const index = new Map<string, IndexedVariant>();

  for (const category of menu.categories) {
    for (const menuItem of category.menuItems) {
      for (const variant of menuItem.variants) {
        const addons = new Map<string, Addon>();
        for (const group of variant.addonGroups) {
          for (const addon of group.addons) {
            addons.set(addon.id, addon);
          }
        }
        index.set(lineKey(menuItem.id, variant.id), { menuItem, variant, addons });
      }
    }
  }

  return index;
}

function groupSelections(addons: CartAddon[]): Record<string, string[]> {
  const byGroup: Record<string, string[]> = {};
  for (const addon of addons) {
    (byGroup[addon.addonGroupId] ??= []).push(addon.addonId);
  }
  return byGroup;
}

/**
 * The owner can tighten addon rules after an item was carted — add a required
 * group, lower maxSelections, or turn off isMultiple. A line that no longer
 * satisfies its own rules can't be ordered, so it has to be rebuilt by hand.
 */
function violatesGroupRules(variant: Variant, addons: CartAddon[]): boolean {
  const selected = groupSelections(addons);

  if (getUnsatisfiedRequiredGroups(variant.addonGroups, selected).length > 0) return true;

  return variant.addonGroups.some((group) => {
    const count = selected[group.id]?.length ?? 0;
    if (!group.isMultiple && count > 1) return true;
    return group.maxSelections !== null && count > group.maxSelections;
  });
}

function isUnchanged(a: CartItem, b: CartItem): boolean {
  return (
    a.menuItemName === b.menuItemName &&
    a.menuItemImage === b.menuItemImage &&
    a.variantName === b.variantName &&
    !differs(a.variantPrice, b.variantPrice) &&
    !differs(a.finalPrice, b.finalPrice) &&
    !differs(a.itemTotal, b.itemTotal, PRICE_EPSILON * Math.max(1, a.quantity)) &&
    a.quantity === b.quantity &&
    a.selectedAddons.length === b.selectedAddons.length &&
    a.selectedAddons.every((addon, i) => {
      const other = b.selectedAddons[i];
      return (
        addon.addonId === other.addonId &&
        addon.name === other.name &&
        !differs(addon.price, other.price)
      );
    })
  );
}

/**
 * Dropping an addon can make two previously distinct lines identical. Merge
 * them, keeping the first line's cartItemId so React keys stay stable.
 */
function mergeDuplicateLines(items: CartItem[]): CartItem[] {
  const merged: CartItem[] = [];

  for (const item of items) {
    const twin = merged.find(
      (candidate) =>
        candidate.menuItemId === item.menuItemId &&
        candidate.variantId === item.variantId &&
        candidate.specialInstructions.trim() === item.specialInstructions.trim() &&
        candidate.selectedAddons.map((a) => a.addonId).sort().join(",") ===
          item.selectedAddons.map((a) => a.addonId).sort().join(",")
    );

    if (!twin) {
      merged.push(item);
      continue;
    }

    twin.quantity += item.quantity;
    twin.itemTotal = calculateItemTotal(twin.finalPrice, twin.selectedAddons, twin.quantity);
  }

  return merged;
}

/**
 * Re-derives every persisted cart line from the live menu.
 *
 * Cart items snapshot their prices at add-time and are persisted to
 * localStorage, so without this they keep a price the admin panel has since
 * changed — indefinitely, and across reloads.
 */
export function repriceCart(items: CartItem[], menu: MenuResponse): RepriceResult {
  const index = buildMenuIndex(menu);
  const next: CartItem[] = [];
  const changes: CartChange[] = [];
  let changed = false;

  for (const item of items) {
    const entry = index.get(lineKey(item.menuItemId, item.variantId));

    if (!entry) {
      changes.push({
        type: "removed",
        cartItemId: item.cartItemId,
        name: item.menuItemName,
        reason: "UNAVAILABLE",
      });
      changed = true;
      continue;
    }

    const { menuItem, variant, addons } = entry;

    const selectedAddons: CartAddon[] = [];
    for (const addon of item.selectedAddons) {
      const live = addons.get(addon.addonId);
      if (!live) {
        changes.push({
          type: "addon-removed",
          cartItemId: item.cartItemId,
          name: menuItem.name,
          addonName: addon.name,
        });
        changed = true;
        continue;
      }
      selectedAddons.push({ ...addon, name: live.name, price: live.price });
    }

    if (violatesGroupRules(variant, selectedAddons)) {
      changes.push({
        type: "removed",
        cartItemId: item.cartItemId,
        name: menuItem.name,
        reason: "NEEDS_RECONFIG",
      });
      changed = true;
      continue;
    }

    // Names and images are snapshots too, so refresh them alongside the prices.
    const repriced: CartItem = {
      ...item,
      menuItemName: menuItem.name,
      menuItemImage: menuItem.images[0]?.url ?? null,
      variantName: variant.name,
      variantPrice: variant.price,
      finalPrice: variant.finalPrice,
      selectedAddons,
      itemTotal: calculateItemTotal(variant.finalPrice, selectedAddons, item.quantity),
    };

    if (differs(repriced.finalPrice, item.finalPrice)) {
      changes.push({
        type: "price",
        cartItemId: item.cartItemId,
        name: menuItem.name,
        from: item.finalPrice,
        to: repriced.finalPrice,
      });
    }

    if (!isUnchanged(item, repriced)) changed = true;
    next.push(repriced);
  }

  if (!changed) {
    // Same array reference — subscribers don't re-render and no toast fires.
    return { items, changes, changed: false };
  }

  return { items: mergeDuplicateLines(next), changes, changed: true };
}
