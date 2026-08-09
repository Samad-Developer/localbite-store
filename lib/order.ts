// lib/orders.ts
import { supabase } from "./supabase-client";
import type { OrderRecord } from "@/types/order";

// Exact casing matters — "orders" is lowercase because Order has @@map("orders"),
// but OrderItem/OrderItemVariant/OrderItemAddon/MenuItem have NO @@map, so Prisma
// created them with their literal Pascal-case names. Postgres treats quoted
// mixed-case identifiers as case-sensitive, and PostgREST/Supabase requires an
// exact match — get this wrong and you'll get a silent "relation not found" error.
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