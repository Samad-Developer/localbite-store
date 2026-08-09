// components/checkout/payment-method-selector.tsx
"use client";

import type { PaymentMethod } from "@/types/api";
import { Banknote, CreditCard, Wallet } from "lucide-react";

const CONFIG: Record<PaymentMethod, { label: string; icon: typeof Banknote }> = {
  CASH: { label: "Cash on delivery", icon: Banknote },
  CARD: { label: "Card", icon: CreditCard },
  ONLINE: { label: "Online payment", icon: Wallet },
};

interface PaymentMethodSelectorProps {
  available: PaymentMethod[];
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ available, selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      {available.map((method) => {
        const { label, icon: Icon } = CONFIG[method];
        const isSelected = selected === method;
        return (
          <button
            key={method}
            type="button"
            onClick={() => onSelect(method)}
            className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
              isSelected
                ? "border-orange-500 bg-orange-50"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <Icon className={`h-5 w-5 ${isSelected ? "text-orange-600" : "text-neutral-400"}`} />
            <span className={`text-sm font-medium ${isSelected ? "text-orange-700" : "text-neutral-700"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}