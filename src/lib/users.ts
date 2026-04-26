import { doc, getDoc, setDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, CartItem } from "@/types";

/** Fetch a user's profile from Firestore */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/** Save or update a user's profile in Firestore */
export async function saveUserProfile(userId: string, profileData: UserProfile): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, { ...profileData, updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}

/** Update only the wishlist field for a user */
export async function updateUserWishlist(userId: string, wishlist: string[]): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, { wishlist, updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error("Error updating wishlist:", error);
    throw error;
  }
}

/** Update only the cart field for a user */
export async function updateUserCart(userId: string, cart: CartItem[]): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, { cart, updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
}

/** Get user by email */
export async function getUserByEmail(email: string): Promise<{ id: string, profile: UserProfile } | null> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, profile: doc.data() as UserProfile };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

/** Get all admins */
export async function getAdmins(): Promise<{ id: string, profile: UserProfile }[]> {
  try {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, profile: doc.data() as UserProfile }));
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

/** Change a user's role */
export async function changeUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, { role, updatedAt: Timestamp.now() }, { merge: true });
  } catch (error) {
    console.error("Error changing user role:", error);
    throw error;
  }
}
