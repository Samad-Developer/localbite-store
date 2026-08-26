export interface OperatingHour {
  day: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface CoverImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  cuisineType: string;
  city: string;
  address: string | null;
  phone: string;
  logoUrl: string | null;
  isOpen: boolean;
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedTime: number;
  acceptsCash: boolean;
  acceptsCard: boolean;
  acceptsOnline: boolean;
  coverImages: CoverImage[];
  operatingHours: OperatingHour[];
}

export type SpicyLevel = "NONE" | "MILD" | "MEDIUM" | "HOT";
export type FoodType = "VEG" | "NON_VEG";
export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  sortOrder: number;
}

export interface AddonGroup {
  id: string;
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  minSelections: number;
  maxSelections: number | null;
  sortOrder: number;
  addons: Addon[];
}

export interface Variant {
  id: string;
  name: string;
  price: number;
  finalPrice: number;
  isDefault: boolean;
  sortOrder: number;
  addonGroups: AddonGroup[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  isAvailable: boolean;
  isBestseller: boolean;
  isNew: boolean;
  spicyLevel: SpicyLevel;
  foodType: FoodType;
  images: { url: string }[];
  discount: Discount | null;
  variants: Variant[];
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  menuItems: MenuItem[];
}

export interface DeliveryArea {
  id: string;
  name: string;
  deliveryFee: number;
  /** Not returned by the admin API today — fall back to the restaurant minimum. */
  minimumOrder?: number;
}

export interface MenuResponse {
  categories: Category[];
  deliveryAreas: DeliveryArea[];
  totalItems: number;
}

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE";
export type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";

export interface OrderAddonPayload {
  addonId: string;
  name: string;
  price: number;
}

export interface OrderItemPayload {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  variantId?: string;
  variantName?: string;
  variantPrice?: number;
  addons?: OrderAddonPayload[];
}

export interface CreateOrderPayload {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  type: OrderType;
  paymentMethod: PaymentMethod;
  specialNotes?: string;
  deliveryAreaId?: string;
  subtotal: number;
  deliveryFee?: number;
  total: number;
  items: OrderItemPayload[];
}

export interface OrderPricing {
  /** True when the server's price differed from what the client submitted. */
  repriced: boolean;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  items: {
    menuItemId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: number;
  message: string;
  /** Absent until the admin panel ships server-side pricing. */
  pricing?: OrderPricing;
}

export type OrderRejectionCode =
  | "ITEMS_UNAVAILABLE"
  | "RESTAURANT_CLOSED"
  | "BELOW_MINIMUM"
  | "DELIVERY_AREA_INVALID"
  | "ORDER_TYPE_UNAVAILABLE"
  | "PAYMENT_METHOD_UNAVAILABLE";

export interface OrderRejection {
  error: "ORDER_REJECTED";
  code: OrderRejectionCode;
  message: string;
  problems?: { menuItemId: string; variantId: string; addonId: string | null; reason: string }[];
  context?: { minimumOrder: number; subtotal: number };
}
