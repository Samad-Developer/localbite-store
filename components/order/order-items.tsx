// components/order/order-items.tsx
import type { OrderItemRecord } from "@/types/order";
import { formatPrice } from "@/lib/utils";

export function OrderItemsList({ items }: { items: OrderItemRecord[] }) {
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-lg bg-brand-soft px-1.5 text-xs font-bold text-brand-strong">
              {item.quantity}
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">
                {item.menuItem?.name ?? "Item"}
              </p>
              {item.variant && (
                <p className="text-xs text-neutral-400">{item.variant.name}</p>
              )}

              {item.addons.length > 0 && (
                <ul className="mt-1.5 space-y-0.5 border-l-2 border-neutral-100 pl-2.5">
                  {item.addons.map((addon, i) => (
                    <li
                      key={`${addon.name}-${i}`}
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
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums text-neutral-900">
              {formatPrice(item.totalPrice)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs tabular-nums text-neutral-400">
                {formatPrice(item.unitPrice)} each
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
