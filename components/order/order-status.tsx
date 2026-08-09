// components/order/order-status.tsx
import { Check, X } from "lucide-react";
import type { OrderStatus } from "@/types/api";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "NEW", label: "Order placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "COMPLETED", label: "Completed" },
];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <X className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium text-red-700">This order was cancelled.</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="flex items-start">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.status} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isComplete
                    ? "bg-orange-500 text-white"
                    : isCurrent
                      ? "bg-orange-500 text-white ring-4 ring-orange-100"
                      : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {!isLast && (
                <div className={`h-0.5 flex-1 transition-colors ${isComplete ? "bg-orange-500" : "bg-neutral-100"}`} />
              )}
            </div>
            <span
              className={`mt-2 text-center text-xs font-medium ${
                isComplete || isCurrent ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}