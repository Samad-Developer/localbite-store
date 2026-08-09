// components/checkout/checkout-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderTypeSelector } from "@/components/cart/order-type-selector";
import { PaymentMethodSelector } from "./payment-method-selector";
import { OrderSummary } from "./order-summary";
import { useCartStore, useCartSubtotal } from "@/store/cart-store";
import { createOrder, ApiError } from "@/lib/api";
import { getAvailablePaymentMethods, getDeliveryFee, getMinimumOrder } from "@/lib/pricing";
import { isRestaurantOpenNow } from "@/lib/utils";
import type { Restaurant, DeliveryArea, PaymentMethod, OrderItemPayload } from "@/types/api";

interface CheckoutFormProps {
  restaurant: Restaurant;
  deliveryAreas: DeliveryArea[];
}

export function CheckoutForm({ restaurant, deliveryAreas }: CheckoutFormProps) {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const deliveryAreaId = useCartStore((s) => s.deliveryAreaId);
  const setOrderType = useCartStore((s) => s.setOrderType);
  const setDeliveryAreaId = useCartStore((s) => s.setDeliveryAreaId);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartSubtotal();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [specialNotes, setSpecialNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const availablePaymentMethods = getAvailablePaymentMethods(restaurant);
  const deliveryFee = getDeliveryFee(orderType, deliveryAreaId, deliveryAreas, restaurant.deliveryFee);
  const minimumOrder = getMinimumOrder(orderType, deliveryAreaId, deliveryAreas, restaurant.minimumOrder);
  const total = subtotal + deliveryFee;
  const isOpen = isRestaurantOpenNow(restaurant.isOpen, restaurant.operatingHours);

  // Every rule that must pass before this order can be placed, named
  // individually so the UI can tell the customer exactly what's missing
  // instead of one generic "can't submit" state.
  const errors = {
    closed: !isOpen,
    emptyCart: items.length === 0,
    name: customerName.trim().length === 0,
    phone: customerPhone.trim().length === 0,
    orderType: orderType === null,
    address: orderType === "DELIVERY" && customerAddress.trim().length === 0,
    deliveryArea: orderType === "DELIVERY" && !deliveryAreaId,
    belowMinimum: orderType === "DELIVERY" && minimumOrder > 0 && subtotal < minimumOrder,
    paymentMethod: paymentMethod === null,
  };
  const isValid = Object.values(errors).every((hasError) => !hasError);

  function buildOrderItems(): OrderItemPayload[] {
    return items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.finalPrice,
      totalPrice: item.itemTotal,
      specialInstructions: item.specialInstructions || undefined,
      variantId: item.variantId,
      variantName: item.variantName,
      variantPrice: item.variantPrice,
      addons: item.selectedAddons.map((a) => ({
        addonId: a.addonId,
        name: a.name,
        price: a.price,
      })),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValid) {
      setShowValidation(true);
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrder({
        restaurantId: restaurant.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: orderType === "DELIVERY" ? customerAddress.trim() : undefined,
        type: orderType!,
        paymentMethod: paymentMethod!,
        specialNotes: specialNotes.trim() || undefined,
        deliveryAreaId: orderType === "DELIVERY" ? deliveryAreaId! : undefined,
        subtotal,
        deliveryFee: orderType === "DELIVERY" ? deliveryFee : 0,
        total,
        items: buildOrderItems(),
      });

      clearCart();
      router.push(`/orders/${result.orderId}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not place your order. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-neutral-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {!isOpen && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            This restaurant is currently closed and can&apos;t accept orders right now.
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your full name"
            />
            {showValidation && errors.name && <p className="mt-1 text-xs text-red-500">Name is required</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="03XX XXXXXXX"
            />
            {showValidation && errors.phone && <p className="mt-1 text-xs text-red-500">Phone is required</p>}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Order type</Label>
          <OrderTypeSelector
            restaurant={restaurant}
            deliveryAreas={deliveryAreas}
            orderType={orderType}
            deliveryAreaId={deliveryAreaId}
            onOrderTypeChange={setOrderType}
            onDeliveryAreaChange={setDeliveryAreaId}
          />
          {showValidation && errors.orderType && (
            <p className="mt-1 text-xs text-red-500">Please select an order type</p>
          )}
          {showValidation && errors.deliveryArea && (
            <p className="mt-1 text-xs text-red-500">Please select a delivery area</p>
          )}
          {showValidation && errors.belowMinimum && (
            <p className="mt-1 text-xs text-red-500">
              Minimum order for this area is {formatMinimum(minimumOrder)}
            </p>
          )}
        </div>

        {orderType === "DELIVERY" && (
          <div>
            <Label htmlFor="address">Delivery address</Label>
            <Input
              id="address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="House / street / area"
            />
            {showValidation && errors.address && <p className="mt-1 text-xs text-red-500">Address is required</p>}
          </div>
        )}

        <div>
          <Label className="mb-2 block">Payment method</Label>
          <PaymentMethodSelector
            available={availablePaymentMethods}
            selected={paymentMethod}
            onSelect={setPaymentMethod}
          />
          {showValidation && errors.paymentMethod && (
            <p className="mt-1 text-xs text-red-500">Please select a payment method</p>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Special notes (optional)</Label>
          <textarea
            id="notes"
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            rows={3}
            placeholder="Anything the kitchen should know..."
            className="w-full resize-none rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-orange-400"
          />
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <OrderSummary restaurant={restaurant} deliveryAreas={deliveryAreas} />
        <Button
          type="submit"
          disabled={isSubmitting || errors.closed}
          className="w-full bg-orange-500 py-6 text-base hover:bg-orange-600 disabled:opacity-50"
        >
          {isSubmitting ? "Placing order..." : "Place Order"}
        </Button>
      </div>
    </form>
  );
}

function formatMinimum(amount: number): string {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(
    amount
  );
}