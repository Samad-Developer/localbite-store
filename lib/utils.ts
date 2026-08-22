import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OperatingHour } from "@/types/api";

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
