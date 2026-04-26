"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { loginUser, logoutUser, loginWithGoogle, resendVerificationEmail } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Package, LogOut, User, Heart, Mail, RefreshCw, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Suspense } from "react";

function AccountContent() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (user && !loading && redirectPath) {
      if (redirectPath === "/admin" && !isAdmin) {
        // Do not redirect to admin if they are not an admin
        return;
      }
      router.push(redirectPath);
    }
  }, [user, loading, redirectPath, isAdmin, router]);

  if (loading) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await loginUser(email, password);
      // The useEffect will handle the redirect once user state updates
    } catch (err: unknown) {
      console.error(err);
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const loggedInUser = await loginWithGoogle();
      const { saveUserProfile } = await import("@/lib/db");
      await saveUserProfile(loggedInUser.uid, {
        firstName: loggedInUser.displayName?.split(" ")[0] || "",
        lastName: loggedInUser.displayName?.split(" ").slice(1).join(" ") || "",
        email: loggedInUser.email || "",
      });
    } catch (err: unknown) {
      console.error("Google Login Error:", err);
      const error = err as { code?: string, message?: string };
      if (error.code === "auth/popup-closed-by-user") {
        setError("تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.");
      } else if (error.code === "auth/operation-not-allowed") {
        setError("تسجيل الدخول باستخدام جوجل غير مفعل في إعدادات Firebase.");
      } else if (error.code === "auth/unauthorized-domain") {
        setError("هذا النطاق (Domain) غير مصرح له بتسجيل الدخول. تحقق من إعدادات Firebase.");
      } else {
        setError(`فشل تسجيل الدخول باستخدام جوجل: ${error.code || "خطأ غير معروف"}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      useCartStore.getState().clearCart();
      useWishlistStore.setState({ items: [] });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleResendEmail = async () => {
    setIsSubmitting(true);
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError("فشل إرسال البريد. حاول مرة أخرى لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    // Check if email is verified (skip check for Google users if preferred, but usually they are verified)
    if (!user.emailVerified) {
      return (
        <Container className="py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-md bg-surface p-10 rounded-xl border border-accent/30 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10" />
            </div>
            <h1 className="font-heading text-3xl text-accent mb-4">تأكيد البريد الإلكتروني</h1>
            <p className="text-text/80 mb-6 leading-relaxed">
              يرجى تأكيد بريدك الإلكتروني لتتمكن من الوصول إلى لوحة تحكم حسابك.
              <br />
              <span className="text-accent font-bold" dir="ltr">{user.email}</span>
            </p>
            
            {resendSuccess ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-3 rounded-md mb-6 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                تم إرسال رابط التأكيد بنجاح!
              </div>
            ) : (
              <button
                onClick={handleResendEmail}
                disabled={isSubmitting}
                className="w-full h-12 border border-accent text-accent font-bold rounded-sm hover:bg-accent hover:text-primary transition-all mb-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                إعادة إرسال الرابط
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full h-12 text-muted hover:text-red-500 transition-colors text-sm underline"
            >
              تسجيل الخروج
            </button>
            
            <p className="mt-8 text-xs text-muted">
              💡 بعد الضغط على الرابط في الإيميل، قم بتحديث هذه الصفحة.
            </p>
          </div>
        </Container>
      );
    }

    // Dashboard View
    return (
      <Container className="py-20 min-h-[70vh]">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          {user.photoURL ? (
             <Image src={user.photoURL} alt="Profile" width={96} height={96} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-accent/20" referrerPolicy="no-referrer" />
          ) : (
             <div className="w-24 h-24 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4 border-2 border-accent/20">
               <User className="w-10 h-10" />
             </div>
          )}
          <h1 className="font-heading text-4xl text-accent mb-2">مرحباً، {user.displayName || "صديقنا"}</h1>
          <p className="text-muted">لوحة تحكم حسابك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/account/orders" className="bg-surface border border-border/50 p-6 rounded-xl hover:border-accent transition-colors flex flex-col items-center justify-center text-center gap-4 group">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading text-xl text-text font-bold mb-1">الطلبات السابقة</h3>
              <p className="text-sm text-muted">تابع حالة طلباتك واستعرض مشترياتك السابقة</p>
            </div>
          </Link>

          <Link href="/wishlist" className="bg-surface border border-border/50 p-6 rounded-xl hover:border-accent transition-colors flex flex-col items-center justify-center text-center gap-4 group">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading text-xl text-text font-bold mb-1">المفضلة</h3>
              <p className="text-sm text-muted">استعرض المنتجات التي أضفتها إلى قائمة مفضلتك</p>
            </div>
          </Link>

          <button onClick={handleLogout} className="bg-surface border border-border/50 p-6 rounded-xl hover:border-red-500/50 transition-colors flex flex-col items-center justify-center text-center gap-4 group">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogOut className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading text-xl text-text font-bold mb-1">تسجيل الخروج</h3>
              <p className="text-sm text-muted">تسجيل الخروج من الحساب الحالي بأمان</p>
            </div>
          </button>
        </div>
      </Container>
    );
  }

  // Login View
  return (
    <Container className="py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
      <h1 className="font-heading text-4xl text-accent mb-6">تسجيل الدخول</h1>
      <p className="text-muted mb-8 max-w-md">يرجى تسجيل الدخول لمتابعة طلباتك، والوصول السريع لبياناتك.</p>
      
      <div className="w-full max-w-sm bg-surface p-8 rounded-xl border border-border/50 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-right">
            <label className="text-sm font-medium text-text mb-1 block">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com" 
              dir="ltr" 
              className="w-full bg-background border border-border rounded-sm h-12 px-4 text-left focus:outline-none focus:ring-2 focus:ring-accent" 
            />
          </div>
          <div className="text-right">
            <label className="text-sm font-medium text-text mb-1 block">كلمة المرور</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr" 
              className="w-full bg-background border border-border rounded-sm h-12 px-4 text-left focus:outline-none focus:ring-2 focus:ring-accent" 
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2 text-right">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-12 bg-accent text-primary font-bold rounded-sm mt-4 hover:bg-accent-light transition-colors shadow-dark disabled:opacity-50"
          >
            {isSubmitting ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs font-bold">
            <span className="bg-surface px-2 text-muted">أو</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 h-12 bg-background border border-border/50 text-text font-bold rounded-sm hover:bg-border/20 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          الدخول باستخدام جوجل
        </button>
        
        <div className="mt-6 pt-6 border-t border-border/50 text-sm text-center">
          <span className="text-muted">ليس لديك حساب؟ </span>
          <Link href="/account/register" className="text-accent hover:underline font-medium focus:outline-none">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
      <AccountContent />
    </Suspense>
  );
}
