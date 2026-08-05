// app/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { getRestaurant, getMenu } from "@/lib/api";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { CartFloatingBar } from "@/components/cart/cart-floating-bar";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant();
  return {
    title: restaurant.name,
    description: restaurant.description ?? `Order online from ${restaurant.name}.`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [restaurant, menu] = await Promise.all([getRestaurant(), getMenu()]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        <Header restaurant={restaurant} deliveryAreas={menu.deliveryAreas}/>
        <main>{children}</main>
        <Footer restaurant={restaurant} />
         <CartFloatingBar />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}