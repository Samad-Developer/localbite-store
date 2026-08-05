"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Category, MenuItem } from "@/types/api";
import { ItemCard } from "./item-card";
import { ItemModal } from "./item-modal";

export function MenuBrowser({ categories }: { categories: Category[] }) {
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
  <div className="sticky top-0 z-40 w-full border-b border-orange-100 bg-orange-50/90 backdrop-blur-sm shadow-sm">
    <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => scrollToCategory(cat.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ${
            activeCategoryId === cat.id
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
              : "bg-white text-neutral-600 hover:bg-orange-100 hover:text-orange-700"
          }`}
        >
          {cat.name}
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
              {/* Category header — full-width band, accent bar, bigger type, item count */}
              <div className="mb-6 flex flex-col items-center gap-1.5 py-2">
                <div className="flex w-full items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-200 to-orange-300" />
                  <h2 className="shrink-0 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    {cat.name}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-orange-200 to-orange-300" />
                </div>
                <span className="text-xs font-medium uppercase tracking-widest text-neutral-400">
                  {cat.menuItems.length} item
                  {cat.menuItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
      </div>

      <ItemModal
        item={activeItem}
        open={activeItem !== null}
        onOpenChange={(open) => !open && setActiveItem(null)}
      />
    </div>
  );
}
