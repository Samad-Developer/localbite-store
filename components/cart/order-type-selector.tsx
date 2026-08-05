// components/cart/order-type-selector.tsx
"use client";

import type { DeliveryArea, OrderType, Restaurant } from "@/types/api";
import { formatPrice } from "@/lib/utils";

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
    <div className="space-y-2">
      <div className="flex gap-2">
        {available.map((type) => (
          <button
            key={type}
            onClick={() => onOrderTypeChange(type)}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
              orderType === type
                ? "border-orange-500 bg-orange-50 text-orange-600"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {LABELS[type]}
          </button>
        ))}
      </div>

      {orderType === "DELIVERY" && (
        <select
          value={deliveryAreaId ?? ""}
          onChange={(e) => onDeliveryAreaChange(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-orange-400"
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
      )}
    </div>
  );
}