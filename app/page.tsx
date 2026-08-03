// app/page.tsx
import { getRestaurant, getMenu } from "@/lib/api";
import { Banner } from "@/components/menu/banner";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { Footer } from "@/components/layout/footer";
import { isRestaurantOpenNow } from "@/lib/utils";

export default async function HomePage() {
  const [restaurant, menu] = await Promise.all([getRestaurant(), getMenu()]);
  const isOpen = isRestaurantOpenNow(
    restaurant.isOpen,
    restaurant.operatingHours,
  );

  return (
    <>
    <div className="px-2 py-2 md:p-6">
      <Banner
        images={restaurant.coverImages}
        restaurantName={restaurant.name}
      />
      </div>

      {!isOpen && (
        <div className="bg-neutral-900 px-4 py-2 text-center text-sm text-white">
          Currently closed &middot; browsing only
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        <MenuBrowser categories={menu.categories} />
      </div>

      <Footer restaurant={restaurant} />
    </>
  );
}
