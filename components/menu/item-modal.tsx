// components/menu/item-modal.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, UtensilsCrossed, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MenuItem, Variant } from "@/types/api";
import { VariantSelector } from "./variant-selector";
import { AddonGroup } from "./addon-group";
import { formatPrice } from "@/lib/utils";
import {
  calculateUnitPrice,
  canAddToCart,
  getSelectedAddonDetails,
  getUnsatisfiedRequiredGroups,
  getVariantDiscount,
  toggleAddonSelection,
} from "@/lib/pricing";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

interface ItemModalProps {
  item: MenuItem | null;
  restaurantLogo: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemModal({ item, restaurantLogo, open, onOpenChange }: ItemModalProps) {

  // default states
  const addItem = useCartStore((s) => s.addItem);
  const defaultVariant = useMemo(
    () => item?.variants.find((v) => v.isDefault) ?? item?.variants[0] ?? null,
    [item],
  );

  // local states
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(defaultVariant);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [lastItemId, setLastItemId] = useState<string | null>(null);

  // Reset all local state whenever a DIFFERENT item is opened.
  // Without this, closing item A and opening item B would keep item A's
  // selected addons/quantity lingering in state — a real bug, not a style choice.
  if (item && item.id !== lastItemId) {
    setLastItemId(item.id);
    setSelectedVariant(item.variants.find((v) => v.isDefault) ?? item.variants[0] ?? null);
    setSelectedAddons({});
    setQuantity(1);
    setSpecialInstructions("");
    setShowValidation(false);
  }

  // Guard against null item or variant
  if (!item || !selectedVariant) return null;

  // Derived values ( filters and calculations )
  const unsatisfiedGroups = getUnsatisfiedRequiredGroups(selectedVariant.addonGroups, selectedAddons);
  const isValid = canAddToCart(selectedVariant.addonGroups, selectedAddons);
  const unitPrice = calculateUnitPrice(selectedVariant, selectedAddons);
  const total = unitPrice * quantity;
  const discount = getVariantDiscount(selectedVariant);
  const originalTotal = discount ? total + discount.amountOff * quantity : total;

  // Fall back to the restaurant logo when the item has no photo, same as the cards do.
  const itemImageUrl = item.images[0]?.url ?? null;
  const imageSrc = itemImageUrl ?? restaurantLogo;

  function handleVariantChange(variant: Variant) {
    setSelectedVariant(variant);
    setSelectedAddons({}); // different variant = different addon groups, so reset
  }

  function handleAddonToggle(
    group: NonNullable<typeof selectedVariant>["addonGroups"][number],
    addonId: string,
  ) {
    setSelectedAddons((prev) => ({
      ...prev,
      [group.id]: toggleAddonSelection(group, prev[group.id] ?? [], addonId),
    }));
  }

  function handleAddToCart() {
    if (!isValid) {
      setShowValidation(true);
      return;
    }

    addItem({
      menuItemId: item!.id,
      menuItemName: item!.name,
      menuItemImage: item!.images[0]?.url ?? null,
      variantId: selectedVariant!.id,
      variantName: selectedVariant!.name,
      variantPrice: selectedVariant!.price,
      finalPrice: selectedVariant!.finalPrice,
      selectedAddons: getSelectedAddonDetails(selectedVariant!, selectedAddons),
      quantity,
      specialInstructions,
    });

    toast.success(`${item!.name} added to cart`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl sm:flex-row"
      >
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/50 backdrop-blur-sm transition-colors hover:bg-black/70 sm:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        {/* LEFT — image only, shown whole: never cropped, never zoomed.
            Mobile: full-bleed across the top. Desktop: own column, pinned to the top
            so it lines up with the header instead of floating mid-panel. */}
        <div className="relative aspect-[16/10] w-full shrink-0 border-b border-neutral-200 sm:aspect-auto sm:w-5/12 sm:self-stretch sm:border-b-0 sm:border-r">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={item.name}
              fill
              sizes="(min-width: 640px) 42vw, 100vw"
              className="object-cover object-top sm:object-contain sm:p-3"
            />
          ) : (
            <div className="flex h-full w-full items-start justify-center pt-10 sm:pt-16">
              <UtensilsCrossed className="h-10 w-10 text-neutral-300" />
            </div>
          )}
        </div>

        {/* RIGHT — fixed header (desktop only), scrolling middle, fixed footer */}
        <div className="flex min-h-0 w-full min-w-0 flex-col sm:w-7/12">
          {/* Desktop header — a sibling of the scroll box, so the scrollbar never spans it.
              Hidden on mobile, but kept in the DOM: the dialog is labelled by this title. */}
          <div className="hidden shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 sm:flex">
            <DialogHeader className="min-w-0 flex-1 p-0 text-left">
              <DialogTitle className="truncate text-lg font-bold text-neutral-900">
                {item.name}
              </DialogTitle>
            </DialogHeader>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrolling middle — the only scrollable region */}
          <div className="custom-scroll min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 px-5 py-4">
              {/* Mobile title — scrolls with the content. aria-hidden because the
                  DialogTitle above already names the dialog. */}
              <h2 aria-hidden className="text-lg font-bold text-neutral-900 sm:hidden">
                {item.name}
              </h2>
            {item.description && (
              <DialogDescription className="text-sm text-neutral-600">
                {item.description}
              </DialogDescription>
            )}

            <VariantSelector
              variants={item.variants}
              selectedVariantId={selectedVariant.id}
              onSelect={handleVariantChange}
            />

            {selectedVariant.addonGroups
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((group) => (
                <div key={group.id}>
                  <AddonGroup
                    group={group}
                    selectedIds={selectedAddons[group.id] ?? []}
                    isUnsatisfied={
                      showValidation && unsatisfiedGroups.includes(group.id)
                    }
                    onToggle={(addonId) => handleAddonToggle(group, addonId)}
                  />
                  {showValidation && unsatisfiedGroups.includes(group.id) && (
                    <p className="mt-1 text-xs text-red-500">
                      Please select {group.minSelections} option
                      {group.minSelections > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              ))}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-900">
                Special instructions
              </h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. no onions, extra spicy..."
                rows={2}
                className="w-full resize-none rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-brand-primary"
              />
            </div>
            </div>
          </div>

          {/* Fixed footer — quantity at the start, Add to Cart taking the rest of the row */}
          <div className="shrink-0 border-t border-neutral-200 bg-white px-5 py-4">
            {discount && (
              <div className="mb-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600">
                  You save {formatPrice(originalTotal - total)}
                </span>
                <span className="text-neutral-400 line-through">{formatPrice(originalTotal)}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-14 shrink-0 items-center gap-1 rounded-2xl border border-neutral-300 px-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-base font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                className="h-14 flex-1 gap-2 rounded-2xl bg-brand-primary text-base font-semibold text-brand-secondary hover:bg-brand-hover"
              >
                <Plus className="h-4 w-4" />
                Add to Cart &middot; {formatPrice(total)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
