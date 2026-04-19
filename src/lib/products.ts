import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "@/types";

export const productsCollection = collection(db, "products");

/** Fetch all products from Firestore */
export async function getProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/** Fetch a single product by its slug */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(productsCollection, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

/** Get a single product by its exact ID (Admin) */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", id);
    const snap = await getDocs(query(productsCollection, where("__name__", "==", id)));
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;
    }
    return null;
  } catch (err) {
    console.error("Error fetching product by id:", err);
    return null;
  }
}

/** Create a new product (Admin) */
export async function createProduct(productData: Omit<Product, "id">): Promise<string> {
  try {
    const newDocRef = doc(productsCollection);
    await setDoc(newDocRef, productData);
    return newDocRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

/** Update an existing product (Admin) */
export async function updateProduct(id: string, productData: Partial<Omit<Product, "id">>): Promise<void> {
  try {
    const docRef = doc(db, "products", id);
    await setDoc(docRef, productData, { merge: true });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

/** Delete a product (Admin) */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { deleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}
