import { collection, doc, setDoc, getDocs, Timestamp, query, where, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Order, OrderInput } from "@/types";

export const ordersCollection = collection(db, "orders");

/** Create a new order in Firestore */
export async function createOrder(orderData: OrderInput, userId?: string): Promise<string> {
  try {
    const newOrderRef = doc(ordersCollection);
    await setDoc(newOrderRef, {
      ...orderData,
      userId: userId ?? null,
      status: "pending",
      paymentMethod: "cod",
      createdAt: Timestamp.now(),
    });
    return newOrderRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/** Get all orders belonging to a specific user */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(ordersCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Order[];

    // Sort descending by createdAt (avoids needing a composite index)
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.createdAt?.toMillis?.() ?? 0;
      return timeB - timeA;
    });

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

/** Get all orders (Admin only) */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const snapshot = await getDocs(ordersCollection);
    const orders = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Order[];

    // Sort by status first (completed/cancelled at the bottom), then descending by createdAt
    orders.sort((a, b) => {
      const isCompletedA = a.status === 'delivered' || a.status === 'cancelled';
      const isCompletedB = b.status === 'delivered' || b.status === 'cancelled';

      if (isCompletedA && !isCompletedB) return 1;
      if (!isCompletedA && isCompletedB) return -1;

      const timeA = a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.createdAt?.toMillis?.() ?? 0;
      return timeB - timeA;
    });

    return orders;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}

/** Update Order Status (Admin only) */
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  const orderRef = doc(db, "orders", orderId);
  try {
    await setDoc(orderRef, { status }, { merge: true });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

/** Get a single order by ID (Admin or Owner) */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const orderRef = doc(db, "orders", orderId);
  try {
    const snap = await getDocs(query(ordersCollection, where("__name__", "==", orderId)));
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
}

/** Delete an order (Admin only) */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

/** Delete all orders associated with a customer phone (Admin only) */
export async function deleteCustomerOrders(phone: string): Promise<void> {
  try {
    const q = query(ordersCollection, where("customer.phone", "==", phone));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, "orders", docSnap.id)));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting customer orders:", error);
    throw error;
  }
}
