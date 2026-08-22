"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import type { Category, MenuItem } from "@/types/api";
import { ItemCard } from "./item-card";
import { BestsellerCard } from "./bestseller-card";
import { ItemModal } from "./item-modal";

interface MenuBrowserProps {
  categories: Category[];
  restaurantLogo: string | null;
}

export function MenuBrowser({ categories, restaurantLogo }: MenuBrowserProps) {
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const searchResults = useMemo<MenuItem[]>(() => {
    if (!isSearching) return [];
    return categories
      .flatMap((c) => c.menuItems)
      .filter((item) => item.name.toLowerCase().includes(trimmedQuery));
  }, [categories, trimmedQuery, isSearching]);

  const bestsellerItems = useMemo<MenuItem[]>(
    () => categories.flatMap((c) => c.menuItems).filter((item) => item.isBestseller),
    [categories],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      setIsStuck(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSearching]);

  useEffect(() => {
    if (isSearching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveCategoryId(visible[0].target.id.replace("category-", ""));
        }
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, [categories, isSearching]);

  function scrollToCategory(id: string) {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div>
      {!isSearching && (
        <>
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
        <div
          className={`sticky top-0 z-40 w-full bg-neutral-50 transition-shadow duration-200 ${
            isStuck
              ? "border-b border-neutral-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              : "border-b border-transparent"
          }`}
        >
          <div className="custom-scroll mx-auto flex w-full max-w-6xl justify-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-150 ${
                  activeCategoryId === cat.id
                    ? "bg-brand-primary text-brand-secondary shadow-sm"
                    : "text-neutral-600 hover:bg-brand-soft hover:text-brand-strong"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        </>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="group flex h-12 items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 transition-colors focus-within:border-brand-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-soft">
            <Search className="h-[18px] w-[18px] shrink-0 text-neutral-400 transition-colors group-focus-within:text-brand-primary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for dishes..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition-colors hover:bg-brand-primary hover:text-brand-secondary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {!isSearching && bestsellerItems.length > 0 && (
          <div className="py-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/15">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">
                  Popular Picks
                </h2>
                <p className="text-xs font-medium text-neutral-500">
                  What people order the most
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {bestsellerItems.map((item) => (
                <BestsellerCard
                  key={item.id}
                  item={item}
                  restaurantLogo={restaurantLogo}
                  onClick={() => setActiveItem(item)}
                />
              ))}
            </div>
          </div>
        )}

        {isSearching ? (
          <div className="pb-8">
            {searchResults.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-500">
                No items match &quot;{query}&quot;
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {searchResults.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    restaurantLogo={restaurantLogo}
                    onClick={() => setActiveItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              id={`category-${cat.id}`}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              className="py-6"
            >
              <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-primary to-brand-hover px-6 py-7 text-center shadow-md sm:px-10 sm:py-14">
                <h2 className="text-3xl font-extrabold uppercase leading-tight tracking-[0.16em] text-brand-secondary sm:text-5xl">
                  {cat.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {cat.menuItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    restaurantLogo={restaurantLogo}
                    onClick={() => setActiveItem(item)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <ItemModal
        item={activeItem}
        restaurantLogo={restaurantLogo}
        open={activeItem !== null}
        onOpenChange={(open) => !open && setActiveItem(null)}
      />
    </div>
  );
}
