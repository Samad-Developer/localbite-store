// types/order.ts
import type { OrderType, OrderStatus, PaymentMethod } from "./api";

export interface OrderItemAddonRecord {
  name: string;
  price: number;
}

export interface OrderItemVariantRecord {
  name: string;
  price: number;
}

export interface OrderItemRecord {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  menuItem: { name: string } | null;
  variant: OrderItemVariantRecord | null;
  addons: OrderItemAddonRecord[];
}

export interface OrderRecord {
  id: string;
  orderNumber: number;
  type: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  specialNotes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: OrderItemRecord[];
}