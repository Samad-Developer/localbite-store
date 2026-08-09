// app/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById } from "@/lib/order";
import { supabase } from "@/lib/supabase-client";
import { OrderStatusTimeline } from "@/components/order/order-status";
import { OrderItemsList } from "@/components/order/order-items";
import { formatPrice } from "@/lib/utils";
import type { OrderRecord } from "@/types/order";
import type { OrderStatus } from "@/types/api";

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <p className="text-sm text-neutral-500">Order #{order.orderNumber}</p>
        <h1 className="text-2xl font-bold text-neutral-900">Thanks, {order.customerName}!</h1>
      </div>

      <div className="mb-6 rounded-xl border border-neutral-200 p-5">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mb-6 rounded-xl border border-neutral-200 p-5">
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

      {order.customerAddress && (
        <div className="rounded-xl border border-neutral-200 p-5 text-sm text-neutral-600">
          <span className="font-medium text-neutral-900">Delivering to: </span>
          {order.customerAddress}
        </div>
      )}
    </div>
  );
}