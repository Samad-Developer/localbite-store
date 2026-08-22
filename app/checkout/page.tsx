import { getRestaurant, getMenu } from "@/lib/api";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default async function CheckoutPage() {
  const [restaurant, menu] = await Promise.all([getRestaurant(), getMenu()]);

  return <CheckoutForm restaurant={restaurant} deliveryAreas={menu.deliveryAreas} />;
}
