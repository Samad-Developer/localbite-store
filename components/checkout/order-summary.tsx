// components/checkout/order-summary.tsx
"use client";

import { useCartStore, useCartSubtotal } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { getDeliveryFee } from "@/lib/pricing";
import type { Restaurant, DeliveryArea } from "@/types/api";

interface OrderSummaryProps {
  restaurant: Restaurant;
  deliveryAreas: DeliveryArea[];
}

export function OrderSummary({ restaurant, deliveryAreas }: OrderSummaryProps) {
  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const deliveryAreaId = useCartStore((s) => s.deliveryAreaId);
  const subtotal = useCartSubtotal();

  const deliveryFee = getDeliveryFee(orderType, deliveryAreaId, deliveryAreas, restaurant.deliveryFee);
  const total = subtotal + deliveryFee;

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <h2 className="mb-3 text-base font-semibold text-neutral-900">Order Summary</h2>

      <div className="custom-scroll max-h-64 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.cartItemId} className="flex justify-between gap-2 text-sm">
            <div className="min-w-0">
              <p className="truncate text-neutral-800">
                {item.quantity}&times; {item.menuItemName}
              </p>
              <p className="text-xs text-neutral-400">{item.variantName}</p>
            </div>
            <span className="shrink-0 font-medium text-neutral-700">{formatPrice(item.itemTotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-neutral-200 pt-3 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {orderType === "DELIVERY" && (
          <div className="flex justify-between text-neutral-600">
            <span>Delivery fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between pt-1 text-base font-semibold text-neutral-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}