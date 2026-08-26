"use client";

import { useRestaurantStatus } from "./restaurant-status-provider";
import { formatTime } from "@/lib/utils";

export function ClosedBanner() {
  const { status } = useRestaurantStatus();

  if (status.isOpen) return null;

  const detail =
    status.reason === "BEFORE_OPEN" && status.opensAt
      ? ` · opens at ${formatTime(status.opensAt)}`
      : "";

  return (
    <div className="bg-neutral-900 px-4 py-2 text-center text-sm text-white">
      Currently closed{detail} &middot; browsing only
    </div>
  );
}
