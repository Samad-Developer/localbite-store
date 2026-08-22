"use client";

import type { PaymentMethod } from "@/types/api";
import { Banknote, Check, CreditCard, Wallet } from "lucide-react";

const CONFIG: Record<PaymentMethod, { label: string; hint: string; icon: typeof Banknote }> = {
  CASH: { label: "Cash", hint: "Pay when it arrives", icon: Banknote },
  CARD: { label: "Card", hint: "Pay by card", icon: CreditCard },
  ONLINE: { label: "Online", hint: "Pay online now", icon: Wallet },
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
        const { label, hint, icon: Icon } = CONFIG[method];
        const isSelected = selected === method;
        return (
          <button
            key={method}
            type="button"
            onClick={() => onSelect(method)}
            aria-pressed={isSelected}
            className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-colors ${
              isSelected
                ? "border-brand-primary bg-brand-soft"
                : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isSelected
                  ? "bg-brand-primary text-brand-secondary"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block text-sm font-semibold ${
                  isSelected ? "text-brand-strong" : "text-neutral-900"
                }`}
              >
                {label}
              </span>
              <span className="block text-xs text-neutral-500">{hint}</span>
            </span>

            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected
                  ? "border-brand-primary bg-brand-primary text-brand-secondary"
                  : "border-neutral-300"
              }`}
            >
              {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
