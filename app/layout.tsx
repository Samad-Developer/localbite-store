// app/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { getRestaurant } from "@/lib/api";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant();
  return {
    title: restaurant.name,
    description: restaurant.description ?? `Order online from ${restaurant.name}.`,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
