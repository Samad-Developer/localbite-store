import { getRestaurant } from "@/lib/api";
import { Footer } from "@/components/layout/footer";

export default async function OrdersLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await getRestaurant();

  return (
    <div className="min-h-screen bg-white">
      <main>{children}</main>
      <Footer restaurant={restaurant} />
    </div>
  );
}
