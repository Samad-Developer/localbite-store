// components/layout/footer.tsx
import Image from "next/image";
import { ArrowUpRight, Bike, Clock, MapPin, Phone, Timer, Wallet } from "lucide-react";
import type { OperatingHour, Restaurant } from "@/types/api";
import { formatPrice } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Site credit — change the name or URL here.
const CREDIT = {
  name: "Samad",
  url: "https://samad-site.vercel.app/",
};

// The API sends 0 = Monday, but JS getDay() is 0 = Sunday.
function todayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

export function Footer({ restaurant }: { restaurant: Restaurant }) {
  const services = [
    restaurant.dineIn && "Dine-in",
    restaurant.takeaway && "Takeaway",
    restaurant.delivery && "Delivery",
  ].filter(Boolean) as string[];

  const payments = [
    restaurant.acceptsCash && "Cash",
    restaurant.acceptsCard && "Card",
    restaurant.acceptsOnline && "Online",
  ].filter(Boolean) as string[];

  const hours: OperatingHour[] = [...(restaurant.operatingHours ?? [])].sort(
    (a, b) => a.day - b.day,
  );
  const today = todayIndex();

  return (
    <footer className="mt-12 bg-neutral-900 text-neutral-300">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-14 sm:px-6 sm:pb-14 lg:px-8">
        {/* Info panels — the brand block lives inside the first one */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Brand + contact */}
          <section className="rounded-2xl bg-neutral-800/50 p-5">
            <div className="flex items-center gap-3">
              {restaurant.logoUrl && (
                <Image
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  width={64}
                  height={64}
                  className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-brand-primary/50"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold tracking-tight text-white">
                  {restaurant.name}
                </p>
                {restaurant.cuisineType && (
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                    {restaurant.cuisineType}
                  </p>
                )}
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-200">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  restaurant.isOpen ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              {restaurant.isOpen ? "Open now" : "Currently closed"}
            </span>

            {restaurant.description && (
              <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                {restaurant.description}
              </p>
            )}

            <ul className="mt-4 space-y-2.5 border-t border-neutral-700/60 pt-4 text-sm">
              {restaurant.address && (
                <li className="flex items-start gap-2.5 text-neutral-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                  <span>
                    {restaurant.address}
                    {restaurant.city && `, ${restaurant.city}`}
                  </span>
                </li>
              )}
              <li>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="inline-flex items-center gap-2.5 font-semibold text-neutral-100 underline-offset-4 transition-colors hover:text-brand-primary hover:underline"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-primary" />
                  {restaurant.phone}
                </a>
              </li>
            </ul>
          </section>

          {/* Hours */}
          <section className="rounded-2xl bg-neutral-800/50 p-5">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
              <Clock className="h-3.5 w-3.5" />
              Opening hours
            </h3>
            {hours.length > 0 ? (
              <ul className="mt-4 space-y-1 text-sm">
                {hours.map((h) => {
                  const isToday = h.day === today;
                  return (
                    <li
                      key={h.day}
                      className={`flex items-center justify-between gap-3 rounded-md px-2 py-1 ${
                        isToday
                          ? "bg-brand-primary/15 font-semibold text-white"
                          : "text-neutral-400"
                      }`}
                    >
                      <span>{DAY_NAMES[h.day] ?? `Day ${h.day}`}</span>
                      <span className={h.isOpen ? "" : "text-neutral-500"}>
                        {h.isOpen
                          ? `${formatTime(h.openTime)} – ${formatTime(h.closeTime)}`
                          : "Closed"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">Hours not listed</p>
            )}
          </section>

          {/* Ordering */}
          <section className="rounded-2xl bg-neutral-800/50 p-5">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
              <Bike className="h-3.5 w-3.5" />
              Ordering
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-neutral-400">
              <li className="flex items-center gap-2.5">
                <Timer className="h-4 w-4 shrink-0 text-brand-primary" />~
                {restaurant.estimatedTime} min prep
              </li>
              {restaurant.delivery && (
                <>
                  <li className="flex items-center gap-2.5">
                    <Bike className="h-4 w-4 shrink-0 text-brand-primary" />
                    {formatPrice(restaurant.deliveryFee)} delivery
                  </li>
                  {restaurant.minimumOrder > 0 && (
                    <li className="flex items-center gap-2.5">
                      <Wallet className="h-4 w-4 shrink-0 text-brand-primary" />
                      {formatPrice(restaurant.minimumOrder)} minimum
                    </li>
                  )}
                </>
              )}
            </ul>

            {services.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-neutral-700/60 px-2.5 py-1 text-[11px] font-semibold text-neutral-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {payments.length > 0 && (
              <p className="mt-3 text-xs text-neutral-500">Pays with {payments.join(" · ")}</p>
            )}
          </section>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {restaurant.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span className="text-neutral-500">Created by</span>
            <a
              href={CREDIT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-sm font-extrabold tracking-tight transition-transform hover:scale-105"
            >
              <span className="credit-name bg-gradient-to-r from-brand-primary via-rose-400 to-amber-300 bg-clip-text text-transparent">
                {CREDIT.name}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-600 transition-colors group-hover:text-brand-primary" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
