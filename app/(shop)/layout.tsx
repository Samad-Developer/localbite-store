// app/(shop)/layout.tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartFloatingBar } from "@/components/cart/cart-floating-bar";
import { getRestaurant, getMenu } from "@/lib/api";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [restaurant, menu] = await Promise.all([getRestaurant(), getMenu()]);

  return (
    <>
      <Header restaurant={restaurant} deliveryAreas={menu.deliveryAreas} />
      <main>{children}</main>
      <Footer restaurant={restaurant} />
      <CartFloatingBar />
    </>
  );
}
