import { getRestaurant } from "@/lib/api";
import { Footer } from "@/components/layout/footer";
import { RestaurantStatusProvider } from "@/components/restaurant/restaurant-status-provider";
import { getRestaurantStatus } from "@/lib/utils";

export default async function OrdersLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await getRestaurant();
  const serverStatus = getRestaurantStatus(restaurant.isOpen, restaurant.operatingHours);

  return (
    <RestaurantStatusProvider restaurant={restaurant} serverStatus={serverStatus}>
      <div className="min-h-screen bg-white">
        <main>{children}</main>
        <Footer restaurant={restaurant} />
      </div>
    </RestaurantStatusProvider>
  );
}
