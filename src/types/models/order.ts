import type { Timestamp } from "firebase/firestore";

// --- Checkout form item shape ---
export interface CheckoutItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  costPrice?: number; // Snapshot of the item's cost at checkout
  selectedSize: string;
  selectedColor: string;
}

// --- Customer / shipping info ---
export interface ShippingInfo {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

// --- Order totals ---
export interface OrderTotals {
  subtotal: number;
  shipping: number;
  totalCost?: number; // Cost of all items
  netProfit?: number; // Profit (subtotal - totalCost)
  finalTotal: number;
}

// --- What checkout sends to createOrder ---
export interface OrderInput {
  customer: ShippingInfo;
  items: CheckoutItem[];
  totals: OrderTotals;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

// --- Full order stored in Firestore ---
export interface Order extends OrderInput {
  id: string;
  userId: string | null;
  status: OrderStatus;
  paymentMethod: "cod";
  createdAt: Timestamp;
}
