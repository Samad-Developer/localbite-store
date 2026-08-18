// components/checkout/checkout-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { OrderTypeSelector } from "@/components/cart/order-type-selector";
import { PaymentMethodSelector } from "./payment-method-selector";
import { OrderSummary } from "./order-summary";
import { useCartStore, useCartSubtotal } from "@/store/cart-store";
import { createOrder, ApiError } from "@/lib/api";
import { getAvailablePaymentMethods, getDeliveryFee, getMinimumOrder } from "@/lib/pricing";
import { cn, isRestaurantOpenNow } from "@/lib/utils";
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
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingBag className="h-7 w-7 text-neutral-300" />
        </div>
        <p className="text-base font-semibold text-neutral-900">Your cart is empty</p>
        <p className="text-sm text-neutral-500">Add a few items and come back to check out.</p>
        <Link
          href="/"
          className="mt-2 inline-flex h-11 items-center rounded-xl bg-brand-primary px-5 text-sm font-semibold text-brand-secondary transition-colors hover:bg-brand-hover"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  const fieldBase =
    "h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm transition-colors focus-visible:border-brand-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-soft";
  const fieldError = "border-red-300 bg-red-50/60";
  const labelBase = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500";

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl px-4 pb-28 pt-2 sm:px-6 lg:pb-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-brand-strong"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Review your order and tell us where it&apos;s going.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {!isOpen && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>This restaurant is currently closed and can&apos;t accept orders right now.</span>
            </div>
          )}

          {/* One card, one flow — fields separated by spacing, not by boxes. */}
          <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" className={labelBase}>
                  Name
                </Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your full name"
                  className={cn(fieldBase, showValidation && errors.name && fieldError)}
                />
                {showValidation && errors.name && <FieldError>Name is required</FieldError>}
              </div>

              <div>
                <Label htmlFor="phone" className={labelBase}>
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="03XX XXXXXXX"
                  className={cn(fieldBase, showValidation && errors.phone && fieldError)}
                />
                {showValidation && errors.phone && <FieldError>Phone is required</FieldError>}
              </div>
            </div>

            <div>
              <Label className={labelBase}>How would you like it?</Label>
              <OrderTypeSelector
                restaurant={restaurant}
                deliveryAreas={deliveryAreas}
                orderType={orderType}
                deliveryAreaId={deliveryAreaId}
                onOrderTypeChange={setOrderType}
                onDeliveryAreaChange={setDeliveryAreaId}
              />
              {showValidation && errors.orderType && <FieldError>Please select an order type</FieldError>}
              {showValidation && errors.deliveryArea && <FieldError>Please select a delivery area</FieldError>}
              {showValidation && errors.belowMinimum && (
                <FieldError>Minimum order for this area is {formatMinimum(minimumOrder)}</FieldError>
              )}
            </div>

            {orderType === "DELIVERY" && (
              <div>
                <Label htmlFor="address" className={labelBase}>
                  Delivery address
                </Label>
                <Input
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House / street / area"
                  className={cn(fieldBase, showValidation && errors.address && fieldError)}
                />
                {showValidation && errors.address && <FieldError>Address is required</FieldError>}
              </div>
            )}

            <div>
              <Label className={labelBase}>Payment method</Label>
              <PaymentMethodSelector
                available={availablePaymentMethods}
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
              {showValidation && errors.paymentMethod && (
                <FieldError>Please select a payment method</FieldError>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className={labelBase}>
                Special notes <span className="normal-case text-neutral-400">(optional)</span>
              </Label>
              <textarea
                id="notes"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                rows={3}
                placeholder="Anything the kitchen should know..."
                className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-soft"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <OrderSummary restaurant={restaurant} deliveryAreas={deliveryAreas} />

          <Button
            type="submit"
            disabled={isSubmitting || errors.closed}
            className="h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary text-base font-semibold text-brand-secondary hover:bg-brand-hover disabled:opacity-50"
          >
            {isSubmitting && <Spinner className="size-4" />}
            {isSubmitting ? "Placing order..." : "Place Order · " + formatMinimum(total)}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            You&apos;ll get an order number to track it
          </p>
        </div>
      </div>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

function formatMinimum(amount: number): string {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(
    amount
  );
}
