// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OperatingHour } from "@/types/api";

// shadcn/ui's standard className merge helper — you'll get this
// automatically when you run `npx shadcn@latest init`, but including
// it here in case you need to recreate it.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * JS's Date.getDay() returns 0=Sunday..6=Saturday.
 * Your API defines 0=Monday..6=Sunday.
 * This mismatch WILL bite you if you don't convert explicitly —
 * so we isolate the conversion in one place instead of repeating
 * it (wrong, probably) in every component that needs "is it open".
 */
function toApiDayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function isRestaurantOpenNow(isOpenToggle: boolean, hours: OperatingHour[]): boolean {
  if (!isOpenToggle) return false;

  const now = new Date();
  const todayIndex = toApiDayIndex(now.getDay());
  const today = hours.find((h) => h.day === todayIndex);

  if (!today || !today.isOpen) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = today.openTime.split(":").map(Number);
  const [closeH, closeM] = today.closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}