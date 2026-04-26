import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { ContactMessage } from "@/types";

export const messagesCollection = collection(db, "messages");

/** Save a contact form submission to Firestore */
export async function saveContactMessage(messageData: ContactMessage): Promise<string> {
  try {
    const docRef = await addDoc(messagesCollection, {
      ...messageData,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

/** Fetch all contact messages (Admin only) */
export async function getMessages(): Promise<(ContactMessage & { id: string; createdAt?: any })[]> {
  try {
    const snapshot = await getDocs(messagesCollection);
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as (ContactMessage & { id: string; createdAt?: any })[];
    
    msgs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() ?? 0;
      const timeB = b.createdAt?.toMillis?.() ?? 0;
      return timeB - timeA;
    });
    
    return msgs;
  } catch (err) {
    console.error("Error fetching messages:", err);
    return [];
  }
}

/** Mark a message as read */
export async function markMessageAsRead(messageId: string): Promise<void> {
  const { doc, setDoc } = await import("firebase/firestore");
  const ref = doc(db, "messages", messageId);
  try {
    await setDoc(ref, { isRead: true }, { merge: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
}

/** Delete a message (Admin only) */
export async function deleteMessage(messageId: string): Promise<void> {
  const { doc, deleteDoc } = await import("firebase/firestore");
  const ref = doc(db, "messages", messageId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}
