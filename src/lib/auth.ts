import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  User
} from "firebase/auth";
import { auth } from "./firebase";

import { logActivity } from "./logger";
import { getUserProfile } from "./users";

// Register a new user + send verification email
export async function registerUser(email: string, password: string, displayName: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with the name
    await updateProfile(user, {
      displayName: displayName
    });

    // Send email verification
    await sendEmailVerification(user);
    
    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Login existing user
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const profile = await getUserProfile(user.uid);
    if (profile?.role === 'admin' || email === 'oh9500585@gmail.com') {
      await logActivity(
        user.uid,
        user.displayName || profile?.firstName || "مدير",
        user.email || email,
        "LOGIN",
        "تسجيل دخول مشرف للنظام"
      );
    }
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (user) {
      const profile = await getUserProfile(user.uid);
      if (profile?.role === 'admin' || user.email === 'oh9500585@gmail.com') {
        await logActivity(
          user.uid,
          user.displayName || profile?.firstName || "مدير",
          user.email || "",
          "LOGOUT",
          "تسجيل خروج المشرف من النظام"
        );
      }
    }
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

// Login with Google
export async function loginWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    const profile = await getUserProfile(user.uid);
    if (profile?.role === 'admin' || user.email === 'oh9500585@gmail.com') {
      await logActivity(
        user.uid,
        user.displayName || profile?.firstName || "مدير",
        user.email || "",
        "LOGIN",
        "تسجيل دخول مشرف للنظام (بواسطة Google)"
      );
    }
    return user;
  } catch (error) {
    console.error("Error logging in with Google:", error);
    throw error;
  }
}

// Resend verification email
export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
}
