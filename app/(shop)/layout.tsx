import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartFloatingBar } from "@/components/cart/cart-floating-bar";
import { CartReconciler } from "@/components/cart/cart-reconciler";
import { RestaurantStatusProvider } from "@/components/restaurant/restaurant-status-provider";
import { getRestaurant, getMenu } from "@/lib/api";
import { getRestaurantStatus } from "@/lib/utils";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [restaurant, menu] = await Promise.all([getRestaurant(), getMenu()]);
  const serverStatus = getRestaurantStatus(restaurant.isOpen, restaurant.operatingHours);

  return (
    <RestaurantStatusProvider restaurant={restaurant} serverStatus={serverStatus}>
      <Header restaurant={restaurant} deliveryAreas={menu.deliveryAreas} />
      <main>{children}</main>
      <Footer restaurant={restaurant} />
      <CartFloatingBar />
      <CartReconciler menu={menu} />
    </RestaurantStatusProvider>
  );
}
