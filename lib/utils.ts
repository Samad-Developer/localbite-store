import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OperatingHour } from "@/types/api";
import { env } from "./env";

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

export function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

/** The API numbers days 0=Mon..6=Sun; JS uses 0=Sun. */
export function toApiDayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

const WEEKDAY_TO_API_INDEX: Record<string, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
};

interface LocalClock {
  dayIndex: number;
  minutes: number;
}

/**
 * Reads the wall clock in the restaurant's timezone rather than the ambient one.
 *
 * This matters because the same helper runs on the server (UTC on Vercel) and
 * in the browser (the customer's zone). Without a fixed zone the two disagree —
 * by five hours for a Pakistan restaurant — so the banner and the checkout
 * button could contradict each other, and SSR would mismatch hydration.
 */
function readLocalClock(now: Date): LocalClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: env.NEXT_PUBLIC_RESTAURANT_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return {
    dayIndex: WEEKDAY_TO_API_INDEX[get("weekday")] ?? toApiDayIndex(now.getDay()),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function toMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** A window whose close is at or before its open runs past midnight (e.g. 18:00–02:00). */
function wrapsMidnight(hour: OperatingHour): boolean {
  return toMinutes(hour.closeTime) <= toMinutes(hour.openTime);
}

export type ClosedReason = "MANUAL_OFF" | "CLOSED_TODAY" | "BEFORE_OPEN" | "AFTER_CLOSE";

export interface RestaurantStatus {
  isOpen: boolean;
  reason: "OPEN" | ClosedReason;
  /** "HH:MM" — when it next opens, if known. */
  opensAt?: string;
  /** "HH:MM" — when the current window ends. */
  closesAt?: string;
}

export function getRestaurantStatus(
  isOpenToggle: boolean,
  hours: OperatingHour[],
  now: Date = new Date()
): RestaurantStatus {
  if (!isOpenToggle) return { isOpen: false, reason: "MANUAL_OFF" };

  const { dayIndex, minutes } = readLocalClock(now);

  // A window opened yesterday can still be running after midnight.
  const yesterday = hours.find((h) => h.day === (dayIndex + 6) % 7);
  if (yesterday?.isOpen && wrapsMidnight(yesterday) && minutes <= toMinutes(yesterday.closeTime)) {
    return { isOpen: true, reason: "OPEN", closesAt: yesterday.closeTime };
  }

  const today = hours.find((h) => h.day === dayIndex);
  if (!today || !today.isOpen) return { isOpen: false, reason: "CLOSED_TODAY" };

  const open = toMinutes(today.openTime);
  const close = toMinutes(today.closeTime);

  if (wrapsMidnight(today)) {
    if (minutes >= open) return { isOpen: true, reason: "OPEN", closesAt: today.closeTime };
    return { isOpen: false, reason: "BEFORE_OPEN", opensAt: today.openTime };
  }

  // closeTime is inclusive, so a 23:59 close stays open through that minute.
  if (minutes >= open && minutes <= close) {
    return { isOpen: true, reason: "OPEN", closesAt: today.closeTime };
  }

  return minutes < open
    ? { isOpen: false, reason: "BEFORE_OPEN", opensAt: today.openTime }
    : { isOpen: false, reason: "AFTER_CLOSE" };
}

export function isRestaurantOpenNow(
  isOpenToggle: boolean,
  hours: OperatingHour[],
  now: Date = new Date()
): boolean {
  return getRestaurantStatus(isOpenToggle, hours, now).isOpen;
}

/** The API day index for "today" in the restaurant's timezone. */
export function getRestaurantDayIndex(now: Date = new Date()): number {
  return readLocalClock(now).dayIndex;
}
