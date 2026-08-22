"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Receipt,
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
import { OrderSkeleton } from "@/components/order/order-skeleton";
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
    return <OrderSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-neutral-900">We couldn&apos;t find this order.</p>
        <p className="text-sm text-neutral-500">{error}</p>
      </div>
    );
  }

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const OrderTypeIcon = ORDER_TYPE_ICONS[order.type];
  const PaymentIcon = PAYMENT_ICONS[order.paymentMethod];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
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

      <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2.5 border-b border-neutral-200 bg-neutral-50 px-5 py-3.5">
          <User className="h-4 w-4 text-brand-primary" />
          <h2 className="text-sm font-bold text-neutral-900">Order details</h2>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-neutral-100">
          <DetailRow icon={User} label="Name" value={order.customerName} />
          <DetailRow
            icon={Phone}
            label="Phone"
            value={
              <a
                href={`tel:${order.customerPhone}`}
                className="font-semibold text-neutral-900 underline-offset-4 hover:text-brand-strong hover:underline"
              >
                {order.customerPhone}
              </a>
            }
          />
          <DetailRow
            icon={OrderTypeIcon}
            label="Order type"
            value={
              <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-strong">
                {ORDER_TYPE_LABELS[order.type]}
              </span>
            }
          />
          <DetailRow
            icon={PaymentIcon}
            label="Payment"
            value={PAYMENT_LABELS[order.paymentMethod]}
          />
          {order.customerAddress && (
            <DetailRow icon={MapPin} label="Address" value={order.customerAddress} full />
          )}
          {order.specialNotes && (
            <DetailRow
              icon={MessageSquareText}
              label="Notes"
              value={<span className="italic text-neutral-500">{order.specialNotes}</span>}
              full
            />
          )}
        </dl>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-2.5 border-b border-neutral-200 bg-neutral-50 px-5 py-3.5">
          <Receipt className="h-4 w-4 text-brand-primary" />
          <h2 className="text-sm font-bold text-neutral-900">Items</h2>
          <span className="ml-auto rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-strong">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="px-5 py-4">
          <OrderItemsList items={order.items} />
        </div>

        <div className="space-y-2 border-t border-neutral-200 px-5 py-4 text-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span>Subtotal</span>
            <span className="font-medium tabular-nums text-neutral-700">
              {formatPrice(order.subtotal)}
            </span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex items-center justify-between text-neutral-500">
              <span>Delivery fee</span>
              <span className="font-medium tabular-nums text-neutral-700">
                {formatPrice(order.deliveryFee)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between bg-neutral-50 px-5 py-4">
          <span className="text-sm font-bold text-neutral-900">Total</span>
          <span className="text-xl font-extrabold tabular-nums tracking-tight text-neutral-900">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-8 text-base font-semibold text-brand-secondary transition-colors hover:bg-brand-hover"
        >
          <RotateCcw className="h-4 w-4" />
          Place Another Order
        </Link>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  full,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`bg-white px-4 py-3 ${full ? "col-span-2" : ""}`}>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}
