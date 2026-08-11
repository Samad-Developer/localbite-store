"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  User,
  Phone,
  MapPin,
  MessageSquareText,
  RotateCcw,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Banknote,
  CreditCard,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getOrderById } from "@/lib/order";
import { supabase } from "@/lib/supabase-client";
import { OrderStatusTimeline } from "@/components/order/order-status";
import { OrderItemsList } from "@/components/order/order-items";
import { formatPrice } from "@/lib/utils";
import type { OrderRecord } from "@/types/order";
import type { OrderStatus, OrderType, PaymentMethod } from "@/types/api";

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  DINE_IN: "Dine-in",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
};

const ORDER_TYPE_ICONS: Record<OrderType, LucideIcon> = {
  DINE_IN: UtensilsCrossed,
  TAKEAWAY: ShoppingBag,
  DELIVERY: Bike,
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash on delivery",
  CARD: "Card",
  ONLINE: "Online payment",
};

const PAYMENT_ICONS: Record<PaymentMethod, LucideIcon> = {
  CASH: Banknote,
  CARD: CreditCard,
  ONLINE: Wallet,
};

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;

    getOrderById(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this order.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Realtime subscription — listens directly to row UPDATEs on "orders",
  // filtered to this one order, so we only react to changes that matter here.
  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          const newStatus = payload.new.status as OrderStatus;
          setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-neutral-400">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-neutral-900">We couldn&apos;t find this order.</p>
        <p className="text-sm text-neutral-500">{error}</p>
      </div>
    );
  }

  const OrderTypeIcon = ORDER_TYPE_ICONS[order.type];
  const PaymentIcon = PAYMENT_ICONS[order.paymentMethod];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Success banner */}
      <div className="mb-6 flex flex-col items-center gap-3 rounded-3xl bg-green-700 px-6 py-9 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-green-700">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Order Placed!</h1>
          <p className="mt-1 text-sm text-green-50">
            Thanks, {order.customerName}. We&apos;ve received your order and we&apos;re getting it ready.
          </p>
        </div>
        <span className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
          Order #{order.orderNumber}
        </span>
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-200 p-5">
        <h2 className="mb-4 text-base font-semibold text-neutral-900">Order Status</h2>
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-200 px-4 py-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-neutral-700">
            <User className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">{order.customerPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <OrderTypeIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">{ORDER_TYPE_LABELS[order.type]}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-700">
            <PaymentIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <span className="truncate">{PAYMENT_LABELS[order.paymentMethod]}</span>
          </div>
          {order.customerAddress && (
            <div className="col-span-2 flex items-center gap-2 text-neutral-700">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span className="truncate">{order.customerAddress}</span>
            </div>
          )}
          {order.specialNotes && (
            <div className="col-span-2 flex items-center gap-2 text-neutral-500">
              <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span className="truncate italic">&quot;{order.specialNotes}&quot;</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-neutral-200 p-5">
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Items</h2>
        <OrderItemsList items={order.items} />

        <div className="mt-4 space-y-1 border-t border-neutral-200 pt-3 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-neutral-600">
              <span>Delivery fee</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-semibold text-neutral-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 text-base font-semibold text-white transition-colors hover:bg-orange-600"
        >
          <RotateCcw className="h-4 w-4" />
          Place Another Order
        </Link>
      </div>
    </div>
  );
}
