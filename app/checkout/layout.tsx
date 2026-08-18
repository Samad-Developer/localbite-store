// app/checkout/layout.tsx
import Image from "next/image";
import Link from "next/link";
import { getRestaurant } from "@/lib/api";
import { Footer } from "@/components/layout/footer";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await getRestaurant();

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-center py-6">
        <Link href="/">
          {restaurant.logoUrl && (
            <Image
              src={restaurant.logoUrl}
              alt={restaurant.name}
              width={64}
              height={64}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-soft"
              priority
            />
          )}
        </Link>
      </div>
      <main>{children}</main>
      <Footer restaurant={restaurant} />
    </div>
  );
}
