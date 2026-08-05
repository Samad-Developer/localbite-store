// components/cart/cart-widget.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartSubtotal, useCartTotalItems } from "@/store/cart-store";
import { CartLineItem } from "./cart-line-item";
import { OrderTypeSelector } from "./order-type-selector";
import { formatPrice } from "@/lib/utils";
import { getDeliveryFee, getMinimumOrder } from "@/lib/pricing";
import type { Restaurant, DeliveryArea } from "@/types/api";

interface CartWidgetProps {
  restaurant: Restaurant;
  deliveryAreas: DeliveryArea[];
}

export function CartWidget({ restaurant, deliveryAreas }: CartWidgetProps) {
  const router = useRouter();

  // Open state now lives in the shared UI store, since the header button
  // AND the floating bar both need to control the same drawer.
 const isOpen = useCartStore((s) => s.isOpen);
 const openCart = useCartStore((s) => s.openCart);
 const closeCart = useCartStore((s) => s.closeCart);

  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const orderType = useCartStore((s) => s.orderType);
  const deliveryAreaId = useCartStore((s) => s.deliveryAreaId);
  const setOrderType = useCartStore((s) => s.setOrderType);
  const setDeliveryAreaId = useCartStore((s) => s.setDeliveryAreaId);

  const subtotal = useCartSubtotal();
  const totalItems = useCartTotalItems();
  const displayCount = hasHydrated ? totalItems : 0;

  const deliveryFee = getDeliveryFee(orderType, deliveryAreaId, deliveryAreas, restaurant.deliveryFee);
  const minimumOrder = getMinimumOrder(orderType, deliveryAreaId, deliveryAreas, restaurant.minimumOrder);
  const total = subtotal + deliveryFee;

  const belowMinimum = orderType === "DELIVERY" && minimumOrder > 0 && subtotal < minimumOrder;
  const needsDeliveryArea = orderType === "DELIVERY" && !deliveryAreaId;
  const canCheckout = items.length > 0 && orderType !== null && !belowMinimum && !needsDeliveryArea;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetTrigger
        aria-label={`Cart, ${displayCount} items`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        <ShoppingBag className="h-5 w-5" />
        {displayCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-medium text-white">
            {displayCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b border-neutral-100 p-4">
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-neutral-500">
            <ShoppingBag className="h-10 w-10 text-neutral-300" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="custom-scroll flex-1 space-y-4 overflow-y-auto p-4">
              <OrderTypeSelector
                restaurant={restaurant}
                deliveryAreas={deliveryAreas}
                orderType={orderType}
                deliveryAreaId={deliveryAreaId}
                onOrderTypeChange={setOrderType}
                onDeliveryAreaChange={setDeliveryAreaId}
              />

              <div className="space-y-2">
                {items.map((item) => (
                  <CartLineItem
                    key={item.cartItemId}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-neutral-200 p-4">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {orderType === "DELIVERY" && (
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Delivery fee</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-neutral-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {belowMinimum && (
                <p className="text-xs text-red-500">Minimum order for this area is {formatPrice(minimumOrder)}</p>
              )}
              {needsDeliveryArea && <p className="text-xs text-red-500">Please select a delivery area</p>}
              {orderType === null && (
                <p className="text-xs text-red-500">Please select dine-in, takeaway, or delivery</p>
              )}

              <Button
                disabled={!canCheckout}
                className="mt-2 flex w-full items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}