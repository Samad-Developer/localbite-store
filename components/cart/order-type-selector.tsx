// components/cart/order-type-selector.tsx
"use client";

import type { DeliveryArea, OrderType, Restaurant } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { UtensilsCrossed, ShoppingBag, Bike, ChevronDown, LucideIcon } from "lucide-react";
interface OrderTypeSelectorProps {
  restaurant: Restaurant;
  deliveryAreas: DeliveryArea[];
  orderType: OrderType | null;
  deliveryAreaId: string | null;
  onOrderTypeChange: (type: OrderType) => void;
  onDeliveryAreaChange: (id: string) => void;
}

const LABELS: Record<OrderType, string> = {
  DINE_IN: "Dine-in",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
};

const ICONS: Record<OrderType, LucideIcon> = {
  DINE_IN: UtensilsCrossed,
  TAKEAWAY: ShoppingBag,
  DELIVERY: Bike,
};

export function OrderTypeSelector({
  restaurant,
  deliveryAreas,
  orderType,
  deliveryAreaId,
  onOrderTypeChange,
  onDeliveryAreaChange,
}: OrderTypeSelectorProps) {
  // Only show modes this restaurant actually offers — driven by real
  // settings, not hardcoded, since not every restaurant does delivery.
  const available: OrderType[] = [
    ...(restaurant.dineIn ? (["DINE_IN"] as const) : []),
    ...(restaurant.takeaway ? (["TAKEAWAY"] as const) : []),
    ...(restaurant.delivery ? (["DELIVERY"] as const) : []),
  ];

  if (available.length === 0) return null;

  return (
    <div className="rounded-2xl bg-neutral-100 p-1">
      <div className="flex gap-1">
        {available.map((type) => {
          const Icon = ICONS[type];
          const isSelected = orderType === type;
          return (
            <button
              key={type}
              onClick={() => onOrderTypeChange(type)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                isSelected ? "bg-white text-brand-strong shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {LABELS[type]}
            </button>
          );
        })}
      </div>

      {orderType === "DELIVERY" && (
        <div className="relative mt-1">
          <select
            value={deliveryAreaId ?? ""}
            onChange={(e) => onDeliveryAreaChange(e.target.value)}
            className="w-full appearance-none rounded-xl border-0 bg-white px-4 py-3 pr-10 text-sm font-medium text-neutral-700 outline-none transition-colors focus:ring-2 focus:ring-brand-primary"
          >
            <option value="" disabled>
              Select delivery area
            </option>
            {deliveryAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} &middot; {formatPrice(area.deliveryFee)} delivery
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      )}
    </div>
  );
}