import Image from "next/image";
import { ArrowUpRight, Bike, Clock, MapPin, Phone, Timer, Wallet } from "lucide-react";
import type { OperatingHour, Restaurant } from "@/types/api";
import { formatPrice } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CREDIT = {
  name: "Samad",
  url: "https://samad-site.vercel.app/",
};

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
    <footer className="mt-12 border-t border-neutral-200 bg-white text-neutral-600">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-14 sm:px-6 sm:pb-14 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex items-center gap-3">
              {restaurant.logoUrl && (
                <div className="relative h-14 w-28 shrink-0">
                  <Image
                    src={restaurant.logoUrl}
                    alt={restaurant.name}
                    fill
                    sizes="112px"
                    className="object-contain object-left"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-lg font-extrabold tracking-tight text-neutral-900">
                  {restaurant.name}
                </p>
                {restaurant.cuisineType && (
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                    {restaurant.cuisineType}
                  </p>
                )}
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  restaurant.isOpen ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              {restaurant.isOpen ? "Open now" : "Currently closed"}
            </span>

            {restaurant.description && (
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                {restaurant.description}
              </p>
            )}

            <ul className="mt-4 space-y-2.5 border-t border-neutral-200 pt-4 text-sm">
              {restaurant.address && (
                <li className="flex items-start gap-2.5 text-neutral-600">
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
                  className="inline-flex items-center gap-2.5 font-semibold text-neutral-900 underline-offset-4 transition-colors hover:text-brand-primary hover:underline"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand-primary" />
                  {restaurant.phone}
                </a>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
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
                          ? "bg-brand-primary/10 font-semibold text-neutral-900"
                          : "text-neutral-600"
                      }`}
                    >
                      <span>{DAY_NAMES[h.day] ?? `Day ${h.day}`}</span>
                      <span className={h.isOpen ? "" : "text-neutral-400"}>
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

          <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">
              <Bike className="h-3.5 w-3.5" />
              Ordering
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
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
                    className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700"
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

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 sm:flex-row sm:justify-between">
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
              <span className="credit-name bg-gradient-to-r from-brand-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">
                {CREDIT.name}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 transition-colors group-hover:text-brand-primary" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
