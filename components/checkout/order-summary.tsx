// components/checkout/order-summary.tsx
"use client";

import { Receipt, Tag } from "lucide-react";
import { useCartStore, useCartSubtotal } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  getDeliveryFee,
  getCartTotalDiscount,
  getCartItemOriginalTotal,
  getCartItemDiscount,
} from "@/lib/pricing";
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
  const totalDiscount = getCartTotalDiscount(items);
  const itemsTotalBeforeDiscount = subtotal + totalDiscount;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-neutral-200 bg-neutral-50 px-5 py-4">
        <Receipt className="h-4 w-4 text-brand-primary" />
        <h2 className="text-sm font-bold text-neutral-900">Order summary</h2>
        <span className="ml-auto rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-strong">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="custom-scroll max-h-72 divide-y divide-neutral-100 overflow-y-auto px-5">
        {items.map((item) => {
          const itemDiscount = getCartItemDiscount(item);
          return (
            <div key={item.cartItemId} className="flex items-start justify-between gap-3 py-3.5">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-neutral-100 px-1 text-[11px] font-bold text-neutral-600">
                  {item.quantity}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">{item.menuItemName}</p>
                  {item.variantName && (
                    <p className="truncate text-xs text-neutral-400">{item.variantName}</p>
                  )}

                  {/* Chosen addons, with what each one added to the price. */}
                  {item.selectedAddons.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 border-l-2 border-neutral-100 pl-2.5">
                      {item.selectedAddons.map((addon) => (
                        <li
                          key={addon.addonId}
                          className="flex items-baseline justify-between gap-2 text-xs text-neutral-500"
                        >
                          <span className="truncate">+ {addon.name}</span>
                          {addon.price > 0 && (
                            <span className="shrink-0 tabular-nums text-neutral-400">
                              {formatPrice(addon.price * item.quantity)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.specialInstructions && (
                    <p className="mt-1.5 truncate text-xs italic text-neutral-400">
                      &ldquo;{item.specialInstructions}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-neutral-900">{formatPrice(item.itemTotal)}</p>
                {itemDiscount > 0 && (
                  <p className="text-xs text-neutral-400 line-through">
                    {formatPrice(getCartItemOriginalTotal(item))}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-neutral-200 px-5 py-4 text-sm">
        {totalDiscount > 0 && (
          <>
            <Row label="Item total" value={formatPrice(itemsTotalBeforeDiscount)} />
            <div className="flex items-center justify-between font-semibold text-emerald-600">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Discount
              </span>
              <span>-{formatPrice(totalDiscount)}</span>
            </div>
          </>
        )}
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        {orderType === "DELIVERY" && (
          <Row label="Delivery fee" value={deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)} />
        )}
      </div>

      <div className="flex items-baseline justify-between bg-neutral-50 px-5 py-4">
        <span className="text-sm font-bold text-neutral-900">Total</span>
        <span className="text-xl font-extrabold tracking-tight text-neutral-900">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-neutral-500">
      <span>{label}</span>
      <span className="font-medium text-neutral-700">{value}</span>
    </div>
  );
}
