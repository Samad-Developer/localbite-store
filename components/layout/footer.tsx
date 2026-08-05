// components/layout/footer.tsx
import type { Restaurant } from "@/types/api";

export function Footer({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-center text-sm text-neutral-500 sm:px-6 lg:px-8">
        <p className="font-medium text-neutral-700">{restaurant.name}</p>
        {restaurant.address && <p className="mt-1">{restaurant.address}</p>}
        <p className="mt-1">{restaurant.phone}</p>
        <p className="mt-4 text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} {restaurant.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}