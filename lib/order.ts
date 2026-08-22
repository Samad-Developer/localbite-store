import { supabase } from "./supabase-client";
import type { OrderRecord } from "@/types/order";

const ORDER_SELECT = `
  id,
  orderNumber,
  type,
  status,
  paymentMethod,
  customerName,
  customerPhone,
  customerAddress,
  specialNotes,
  subtotal,
  deliveryFee,
  total,
  createdAt,
  items:OrderItem (
    id,
    quantity,
    unitPrice,
    totalPrice,
    menuItem:MenuItem ( name ),
    variant:OrderItemVariant ( name ),
    addons:OrderItemAddon ( name, price )
  )
`;

export async function getOrderById(orderId: string): Promise<OrderRecord> {
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", orderId).single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as OrderRecord;
}
