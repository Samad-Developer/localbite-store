export interface OperatingHour {
  day: number; // 0=Monday ... 6=Sunday
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "22:00"
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
  minimumOrder: number;
}

export interface MenuResponse {
  categories: Category[];
  deliveryAreas: DeliveryArea[];
  totalItems: number;
}

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE";
export type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED";

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

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: number;
  message: string;
}