"use client";

import { useRestaurantStatus } from "./restaurant-status-provider";
import { formatTime } from "@/lib/utils";

export function OpenStatusPill() {
  const { status } = useRestaurantStatus();

  const label = status.isOpen
    ? "Open now"
    : status.reason === "BEFORE_OPEN" && status.opensAt
      ? `Opens at ${formatTime(status.opensAt)}`
      : "Currently closed";

  return (
    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
      <span
        className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? "bg-emerald-500" : "bg-red-500"}`}
      />
      {label}
    </span>
  );
}
