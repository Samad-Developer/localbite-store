// components/order/order-status.tsx
import { Check, X, Receipt, CircleCheck, ChefHat, PackageCheck, PartyPopper, type LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/types/api";

const STEPS: { status: OrderStatus; label: string; description: string; icon: LucideIcon }[] = [
  { status: "NEW", label: "Order placed", description: "We've received your order", icon: Receipt },
  { status: "CONFIRMED", label: "Confirmed", description: "The restaurant accepted your order", icon: CircleCheck },
  { status: "PREPARING", label: "Preparing", description: "Your food is being cooked", icon: ChefHat },
  { status: "READY", label: "Ready", description: "Your order is ready to go", icon: PackageCheck },
  { status: "COMPLETED", label: "Completed", description: "Enjoy your meal!", icon: PartyPopper },
];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <X className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-red-700">This order was cancelled.</p>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div>
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isDone = isComplete || isCurrent;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.status} className="flex gap-3">
            {/* Rail: icon bubble + connector line down to the next step */}
            <div className="flex flex-col items-center">
              <div className="relative shrink-0">
                {isCurrent && <span className="absolute inset-0 animate-ping rounded-full bg-orange-400 opacity-60" />}
                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isComplete
                      ? "bg-orange-500 text-white"
                      : isCurrent
                        ? "bg-orange-500 text-white ring-4 ring-orange-100"
                        : "bg-neutral-100 text-neutral-300"
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 rounded-full transition-colors ${
                    isComplete ? "bg-orange-500" : "bg-neutral-100"
                  }`}
                />
              )}
            </div>

            <div className={isLast ? "pb-0 pt-1" : "pb-6 pt-1"}>
              <p className={`text-sm font-semibold ${isDone ? "text-neutral-900" : "text-neutral-400"}`}>
                {step.label}
              </p>
              <p className={`text-xs ${isDone ? "text-neutral-500" : "text-neutral-300"}`}>{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
