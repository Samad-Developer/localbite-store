"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Restaurant } from "@/types/api";
import { getRestaurant } from "@/lib/api";
import { getRestaurantStatus, type RestaurantStatus } from "@/lib/utils";

/** How often to re-read the admin toggle while the tab is visible. */
const POLL_MS = 60_000;
/** Floor between event-driven refetches (focus, visibility, online). */
const REFETCH_THROTTLE_MS = 15_000;
/** How often to re-evaluate the schedule. Costs nothing — no network. */
const TICK_MS = 30_000;
const MAX_BACKOFF_MS = 5 * 60_000;

/**
 * A tiny external store for the wall clock.
 *
 * The schedule has to be re-evaluated over time, but reading `Date.now()`
 * during render would desync SSR from hydration. `useSyncExternalStore` with a
 * server snapshot of 0 lets the server and the first client render agree, then
 * flips to the live clock once subscribed — the same shape as useCartHasHydrated.
 */
const clockListeners = new Set<() => void>();
let clockNow = 0;

function bumpClock() {
  clockNow = Date.now();
  for (const listener of clockListeners) listener();
}

function subscribeClock(onChange: () => void) {
  clockListeners.add(onChange);
  // Go live immediately after hydration rather than waiting a full tick.
  bumpClock();

  const tick = () => {
    if (document.hidden) return;
    bumpClock();
  };
  // Background tabs throttle timers, so also recompute the moment the user returns.
  const id = setInterval(tick, TICK_MS);
  document.addEventListener("visibilitychange", tick);
  window.addEventListener("focus", tick);

  return () => {
    clockListeners.delete(onChange);
    clearInterval(id);
    document.removeEventListener("visibilitychange", tick);
    window.removeEventListener("focus", tick);
  };
}

const getClock = () => clockNow;
const getServerClock = () => 0;

interface RestaurantStatusValue {
  restaurant: Restaurant;
  isOpen: boolean;
  status: RestaurantStatus;
}

const RestaurantStatusContext = createContext<RestaurantStatusValue | null>(null);

export function useRestaurantStatus(): RestaurantStatusValue {
  const value = useContext(RestaurantStatusContext);
  if (!value) {
    throw new Error("useRestaurantStatus must be used inside <RestaurantStatusProvider>");
  }
  return value;
}

export function useIsRestaurantOpen(): boolean {
  return useRestaurantStatus().isOpen;
}

interface Props {
  restaurant: Restaurant;
  /** Computed on the server so the first client render matches the SSR markup. */
  serverStatus: RestaurantStatus;
  children: React.ReactNode;
}

export function RestaurantStatusProvider({ restaurant, serverStatus, children }: Props) {
  const [polled, setPolled] = useState<Restaurant | null>(null);
  const [seenProp, setSeenProp] = useState(restaurant);

  // A fresh server render (e.g. after router.refresh()) is newer than any poll.
  if (seenProp !== restaurant) {
    setSeenProp(restaurant);
    setPolled(null);
  }

  const data = polled ?? restaurant;
  const now = useSyncExternalStore(subscribeClock, getClock, getServerClock);

  const lastFetchedAt = useRef(0);
  const inFlight = useRef(false);
  const backoff = useRef(POLL_MS);

  const refresh = useCallback(async (force: boolean) => {
    if (inFlight.current) return;
    if (!force && Date.now() - lastFetchedAt.current < REFETCH_THROTTLE_MS) return;

    inFlight.current = true;
    try {
      const fresh = await getRestaurant();
      setPolled(fresh);
      lastFetchedAt.current = Date.now();
      backoff.current = POLL_MS;
      bumpClock();
    } catch {
      // Keep the last known value and back off. Never toast — this runs on a timer.
      backoff.current = Math.min(backoff.current * 2, MAX_BACKOFF_MS);
    } finally {
      inFlight.current = false;
    }
  }, []);

  // Polls the admin toggle while the tab is visible.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(async () => {
        if (!document.hidden) await refresh(true);
        schedule();
      }, backoff.current);
    };
    schedule();

    const onWake = () => {
      if (document.hidden) return;
      void refresh(false);
    };

    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
    };
  }, [refresh]);

  // now === 0 on the server and on the first client render, so hydration matches exactly.
  const status =
    now === 0 ? serverStatus : getRestaurantStatus(data.isOpen, data.operatingHours, new Date(now));

  return (
    <RestaurantStatusContext.Provider value={{ restaurant: data, isOpen: status.isOpen, status }}>
      {children}
    </RestaurantStatusContext.Provider>
  );
}
