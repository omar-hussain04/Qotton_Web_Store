import type { Timestamp } from "firebase/firestore";
import type { CartItem } from "./cart";

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  address?: string;
  email?: string;
  wishlist?: string[];
  cart?: CartItem[];
  role?: 'admin' | 'user';
  updatedAt?: Timestamp;
}
