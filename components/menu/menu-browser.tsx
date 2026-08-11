"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Flame } from "lucide-react";
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
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      {/* Sticky category tabs — full-bleed bar, but inner content aligned to the same container width as everything else */}
      {!isSearching && (
        <div className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-x-6 gap-y-1 px-4 sm:px-6 lg:px-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`relative shrink-0 whitespace-nowrap py-4 text-sm font-semibold tracking-wide transition-colors duration-150 ${
                  activeCategoryId === cat.id
                    ? "text-orange-600"
                    : "text-neutral-500 hover:text-orange-500"
                }`}
              >
                {cat.name}
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-orange-500 transition-transform duration-200 ${
                    activeCategoryId === cat.id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Everything below shares one consistent centered container */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:bg-white"
            />
          </div>
        </div>

        {!isSearching && bestsellerItems.length > 0 && (
          <div className="py-4">
            <div className="mb-3 flex items-center gap-2">
              <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
              <h2 className="text-lg font-bold text-neutral-900">Customer Favorites</h2>
            </div>
            <div className="custom-scroll flex gap-3 overflow-x-auto pb-2">
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
              {/* Category header — big centered banner with decorative accents */}
              <div className="relative mb-8 flex flex-col items-center gap-2 overflow-hidden rounded-3xl bg-orange-50 py-8 text-center">
                <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/30 blur-3xl" />
                <span className="relative flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">
                  <span className="h-px w-6 bg-orange-300" />
                  Menu
                  <span className="h-px w-6 bg-orange-300" />
                </span>
                <h2 className="relative text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                  {cat.name}
                </h2>
                <span className="relative rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm">
                  {cat.menuItems.length} item
                  {cat.menuItems.length !== 1 ? "s" : ""}
                </span>
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
        open={activeItem !== null}
        onOpenChange={(open) => !open && setActiveItem(null)}
      />
    </div>
  );
}
