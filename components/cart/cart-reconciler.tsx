"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MenuResponse } from "@/types/api";
import type { CartChange } from "@/lib/cart-reprice";
import { useCartHasHydrated, useCartStore } from "@/store/cart-store";

function announce(changes: CartChange[]) {
  const gone = changes.filter((c) => c.type === "removed" && c.reason === "UNAVAILABLE");
  const reconfig = changes.filter((c) => c.type === "removed" && c.reason === "NEEDS_RECONFIG");
  const addons = changes.filter((c) => c.type === "addon-removed");
  const priced = changes.filter((c) => c.type === "price");

  if (gone.length === 1) {
    toast.warning(`${gone[0].name} is no longer available and was removed from your cart.`, {
      id: "cart-reprice-removed",
    });
  } else if (gone.length > 1) {
    toast.warning(`${gone.length} items are no longer available and were removed from your cart.`, {
      id: "cart-reprice-removed",
    });
  }

  if (reconfig.length > 0) {
    const label =
      reconfig.length === 1 ? `${reconfig[0].name} has` : `${reconfig.length} items have`;
    toast.warning(`${label} changed options. Please add it to your cart again.`, {
      id: "cart-reprice-reconfig",
    });
  }

  if (addons.length === 1) {
    toast.warning(`"${addons[0].addonName}" is no longer available and was removed.`, {
      id: "cart-reprice-addon",
    });
  } else if (addons.length > 1) {
    toast.warning(`${addons.length} add-ons are no longer available and were removed.`, {
      id: "cart-reprice-addon",
    });
  }

  if (priced.length > 0) {
    // A price that dropped is good news — don't dress it as a warning.
    const cheaper = priced.every((c) => c.type === "price" && c.to < c.from);
    const message = priced.length === 1 ? `The price of ${priced[0].name} changed.` : "Some prices have changed.";
    if (cheaper) {
      toast.success(message, { id: "cart-reprice-price" });
    } else {
      toast.info(message, { id: "cart-reprice-price" });
    }
  }
}

/**
 * Cart lines snapshot their price when added and are persisted to localStorage,
 * so they drift the moment the admin panel edits a price. The layouts already
 * fetch a fresh menu server-side on every navigation, so re-pricing against
 * that prop costs no extra request.
 */
export function CartReconciler({ menu }: { menu: MenuResponse }) {
  const router = useRouter();
  const hasHydrated = useCartHasHydrated();
  const isCartOpen = useCartStore((s) => s.isOpen);
  const applyReprice = useCartStore((s) => s.applyReprice);
  const setRepriceChanges = useCartStore((s) => s.setRepriceChanges);
  const closeCart = useCartStore((s) => s.closeCart);

  // Only announce a given set of changes once, even as this effect re-runs.
  const lastAnnounced = useRef<string | null>(null);

  useEffect(() => {
    // Waiting for persist rehydration keeps SSR and client markup identical.
    if (!hasHydrated) return;

    const changes = applyReprice(menu);
    if (changes.length === 0) return;

    const signature = JSON.stringify(changes);
    if (lastAnnounced.current === signature) return;
    lastAnnounced.current = signature;

    setRepriceChanges(changes);
    announce(changes);

    if (useCartStore.getState().items.length === 0) closeCart();

    // The menu cards rendered around us were built from the same stale data.
    router.refresh();
  }, [hasHydrated, menu, isCartOpen, applyReprice, setRepriceChanges, closeCart, router]);

  return null;
}
