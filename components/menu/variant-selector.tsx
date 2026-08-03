// components/menu/variant-selector.tsx
import type { Variant } from "@/types/api";
import { formatPrice } from "@/lib/utils";

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onSelect: (variant: Variant) => void;
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  // Rule from your spec: single default variant → don't even show a selector.
  if (variants.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isSelected = variant.id === selectedVariantId;
        return (
          <button
            key={variant.id}
            onClick={() => onSelect(variant)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isSelected
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {variant.name} &middot; {formatPrice(variant.finalPrice)}
          </button>
        );
      })}
    </div>
  );
}