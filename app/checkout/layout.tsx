import Image from "next/image";
import Link from "next/link";
import { getRestaurant } from "@/lib/api";
import { Footer } from "@/components/layout/footer";
import { RestaurantStatusProvider } from "@/components/restaurant/restaurant-status-provider";
import { getRestaurantStatus } from "@/lib/utils";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await getRestaurant();
  const serverStatus = getRestaurantStatus(restaurant.isOpen, restaurant.operatingHours);

  return (
    <RestaurantStatusProvider restaurant={restaurant} serverStatus={serverStatus}>
      <div className="min-h-screen bg-white">
        <div className="flex justify-center py-6">
          <Link href="/">
            {restaurant.logoUrl && (
              <div className="relative h-14 w-32">
                <Image
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  fill
                  sizes="128px"
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </Link>
        </div>
        <main>{children}</main>
        <Footer restaurant={restaurant} />
      </div>
    </RestaurantStatusProvider>
  );
}
