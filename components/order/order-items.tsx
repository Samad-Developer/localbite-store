// components/order/order-items.tsx
import type { OrderItemRecord } from "@/types/order";
import { formatPrice } from "@/lib/utils";

export function OrderItemsList({ items }: { items: OrderItemRecord[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between gap-3 border-b border-neutral-100 pb-3 last:border-0">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">
              {item.quantity}&times; {item.menuItem?.name ?? "Item"}
            </p>
            {item.variant && <p className="text-xs text-neutral-500">{item.variant.name}</p>}
            {item.addons.length > 0 && (
              <p className="text-xs text-neutral-400">{item.addons.map((a) => a.name).join(", ")}</p>
            )}
          </div>
          <span className="shrink-0 text-sm font-medium text-neutral-700">{formatPrice(item.totalPrice)}</span>
        </div>
      ))}
    </div>
  );
}