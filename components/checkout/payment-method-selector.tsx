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
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {available.map((method) => {
        const { label, icon: Icon } = CONFIG[method];
        const isSelected = selected === method;
        return (
          <button
            key={method}
            type="button"
            onClick={() => onSelect(method)}
            className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all ${
              isSelected ? "bg-orange-50 ring-1 ring-orange-500" : "bg-neutral-50 hover:bg-neutral-100"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                isSelected ? "bg-orange-500 text-white" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className={`text-sm font-semibold ${isSelected ? "text-orange-700" : "text-neutral-700"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}