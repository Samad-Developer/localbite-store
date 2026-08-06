// components/menu/item-modal.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  toggleAddonSelection,
} from "@/lib/pricing";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

interface ItemModalProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemModal({ item, open, onOpenChange }: ItemModalProps) {

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
        className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl p-0 sm:mx-auto sm:max-w-xl"
      >
        <div className="">
          {item.images[0] && (
            <div className="relative aspect-video w-full">
              <Image
                src={item.images[0].url}
                alt={item.name}
                fill
                className="object-cover"
              />
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="custom-scroll flex flex-1 flex-col overflow-y-auto">
          <div className="space-y-5 p-4">
            <DialogHeader className="p-0 text-left">
              <DialogTitle>{item.name}</DialogTitle>
              {item.description && (
                <DialogDescription className="text-sm text-neutral-600">
                  {item.description}
                </DialogDescription>
              )}
            </DialogHeader>

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
                className="w-full resize-none rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div className="border-t border-neutral-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                Quantity
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Add to Cart &middot; {formatPrice(total)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
