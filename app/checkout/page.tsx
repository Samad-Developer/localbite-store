import { getRestaurant, getMenu } from "@/lib/api";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CartReconciler } from "@/components/cart/cart-reconciler";

export default async function CheckoutPage() {
  const [restaurant, menu] = await Promise.all([getRestaurant(), getMenu()]);

  return (
    <>
      <CartReconciler menu={menu} />
      <CheckoutForm restaurant={restaurant} deliveryAreas={menu.deliveryAreas} />
    </>
  );
}
