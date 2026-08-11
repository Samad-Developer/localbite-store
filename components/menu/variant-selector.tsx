// components/menu/variant-selector.tsx
import type { Variant } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { getVariantDiscount, formatVariantDiscount } from "@/lib/pricing";

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
        const discount = getVariantDiscount(variant);
        return (
          <button
            key={variant.id}
            onClick={() => onSelect(variant)}
            className={`flex flex-col items-start gap-0.5 rounded-xl border px-4 py-2 text-left transition-colors ${
              isSelected
                ? "border-orange-500 bg-orange-50"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
          >
            <span className={`text-sm font-medium ${isSelected ? "text-orange-600" : "text-neutral-700"}`}>
              {variant.name}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-neutral-900">{formatPrice(variant.finalPrice)}</span>
              {discount && (
                <>
                  <span className="text-xs text-neutral-400 line-through">{formatPrice(variant.price)}</span>
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {formatVariantDiscount(discount)}
                  </span>
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}