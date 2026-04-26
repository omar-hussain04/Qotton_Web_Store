import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'OTHER';

export interface ActivityLog {
  id?: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: ActivityAction;
  details: string;
  createdAt: Timestamp;
}

export async function logActivity(
  adminId: string,
  adminName: string,
  adminEmail: string,
  action: ActivityAction,
  details: string
): Promise<void> {
  try {
    const logsCol = collection(db, "activity_logs");
    await addDoc(logsCol, {
      adminId,
      adminName,
      adminEmail,
      action,
      details,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export async function getRecentActivityLogs(maxCount: number = 50): Promise<ActivityLog[]> {
  try {
    const q = query(
      collection(db, "activity_logs"),
      orderBy("createdAt", "desc"),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return [];
  }
}

export async function clearAllActivityLogs(): Promise<void> {
  try {
    const q = query(collection(db, "activity_logs"));
    const snapshot = await getDocs(q);
    
    // Create an array of promises to delete all documents
    const deletePromises = snapshot.docs.map(document => 
      deleteDoc(doc(db, "activity_logs", document.id))
    );
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Failed to clear activity logs:", error);
    throw error;
  }
}
