// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { getRestaurant } from "@/lib/api";
import "./globals.css";

// Self-hosted by next/font — no external request, no layout shift.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant();
  return {
    title: restaurant.name,
    description: restaurant.description ?? `Order online from ${restaurant.name}.`,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen bg-white antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
