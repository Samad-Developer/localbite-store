import { getRestaurant, getMenu } from "@/lib/api";
import { Banner } from "@/components/menu/banner";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { ClosedBanner } from "@/components/restaurant/closed-banner";

export default async function HomePage() {
  const [restaurant, menu] = await Promise.all([getRestaurant(), getMenu()]);

  return (
    <>
      <div className="px-2 py-2 md:p-6">
        <Banner
          images={restaurant.coverImages}
          restaurantName={restaurant.name}
        />
      </div>

      <ClosedBanner />

      <MenuBrowser categories={menu.categories} restaurantLogo={restaurant.logoUrl} />
    </>
  );
}
