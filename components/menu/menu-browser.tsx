// components/menu/menu-browser.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Category, MenuItem } from "@/types/api";
import { ItemCard } from "./item-card";
import { ItemModal } from "./item-modal"; // add

export function MenuBrowser({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? "",
  );
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null); // add
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const searchResults = useMemo<MenuItem[]>(() => {
    if (!isSearching) return [];
    return categories
      .flatMap((c) => c.menuItems)
      .filter((item) => item.name.toLowerCase().includes(trimmedQuery));
  }, [categories, trimmedQuery, isSearching]);

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
        <div className="sticky top-[65px] z-40 border-b border-neutral-200 bg-white">
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategoryId === cat.id
                    ? "bg-orange-500 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
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

      {isSearching ? (
        <div className="px-4 pb-8">
          {searchResults.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">
              No items match &quot;{query}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {searchResults.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
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
            className="px-4 py-4"
          >
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">
              {cat.name}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {cat.menuItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => setActiveItem(item)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <ItemModal
        item={activeItem}
        open={activeItem !== null}
        onOpenChange={(open) => !open && setActiveItem(null)}
      />
    </div>
  );
}
